pragma solidity ^0.5.1;

library utils {
    function remove(address _address, address[] storage list) public returns(address[] storage) {
        uint indexToBeDeleted = 1000;
        uint arrayLength = list.length;
        for (uint i=0; i<arrayLength; i++) {
            if (list[i] == _address) {
                indexToBeDeleted = i;
                break;
            }
        }
        // if index to be deleted is not the last index, swap position.
        
        if (indexToBeDeleted != 1000) {
            if (indexToBeDeleted < arrayLength-1) {
                list[indexToBeDeleted] = list[arrayLength-1];
            }
            list.pop();   
        }
        
        return list;
    }
}

contract secretSantaFactory {
  address private admin = msg.sender;
  struct SecretSantaEvent {
    address owner;
    address contractAdress;
    uint creationTime;
  }
  
  event Deployed(bool status);
  event Deleted(bool status);


  mapping (address => SecretSantaEvent) secretSantaEvents;
  address[] public secretSantaAddresses;

  // useful to know the row count in contracts index

  function getSecretSantaEvents() view public returns(address [] memory) {
    return secretSantaAddresses;
  }
  
  function getSecretSantaEvent(address _address) view public returns(address, address, uint) {
    return (secretSantaEvents[_address].contractAdress, secretSantaEvents[_address].owner, secretSantaEvents[_address].creationTime);
  }
  
  function removeSecretSantaEvent(address _address) public {
    if (secretSantaEvents[_address].owner == msg.sender || admin == msg.sender) {
        utils.remove(_address, secretSantaAddresses);
        emit Deleted(true);
    } else {
        emit Deleted(false);
    }
  }

  // deploy a new contract

  function newSecretSantaEvent()
    public
  {
    address contractAdress = address(new SecretSanta());

    SecretSantaEvent storage secretSantaEvent = secretSantaEvents[contractAdress];
    secretSantaEvent.contractAdress = contractAdress;
    secretSantaEvent.owner = msg.sender;
    secretSantaEvent.creationTime = now;
        
    secretSantaAddresses.push(contractAdress) -1;
    emit Deployed(true);
  }
}

contract SecretSanta {
    address private owner = msg.sender;
    bool public isOpen = true;
    event Added(bool status);

    struct Participant {
        string name;
        string wishlist;
        address secretSanta;
        uint index;
    }
    
    modifier onlyBy(address _account)
    {
        require(
            msg.sender == _account,
            "Sender not authorized."
        );
        _;
    }
    
    mapping (address => Participant) participants;
    address[] public participantAccts;
    address[] private rollingList;
    address[] private remainingParticipants;
    
    function register(string memory _name, string memory _wishlist) public {
        if(isOpen) { // registration is open
            Participant storage participant = participants[msg.sender];
            participant.name = _name;
            participant.wishlist = _wishlist;
        
            participantAccts.push(msg.sender) -1;
            emit Added(isOpen);
        } else {
            emit Added(false);
        }
    }
    
    function isOwner() view public returns(bool) {
        if(owner == msg.sender) {
            return true;
        }
        return false;
    }
    
    function getParticpants() view public returns(address [] memory) {
        return participantAccts;
    }
    
    function getSecretSanta() view public returns (string memory, string memory) {
        address secretSanta = participants[msg.sender].secretSanta;
        
        return (participants[secretSanta].name, participants[secretSanta].wishlist);
    }
    
    function getRegistration() view public returns (string memory, string memory, address) {
        return (participants[msg.sender].name, participants[msg.sender].wishlist, participants[msg.sender].secretSanta);
    }
    
    function getParticpant(address _address) onlyBy(owner) view public returns (string memory, string memory) {
        return (participants[_address].name, participants[_address].wishlist);
    }
    
    function countParticpants() view public returns (uint) {
        return participantAccts.length;
    }
    
    function deleteParticpant(address addressToBeDeleted) public onlyBy(owner) {
        utils.remove(addressToBeDeleted, participantAccts);
    }
    
    function closeRegistration() public onlyBy(owner) {
        rollingList = participantAccts;
        
        uint arrayLength = participantAccts.length;
        for (uint i=0; i<arrayLength; i++) {
            address participantAddress = participantAccts[i];
            remainingParticipants.length = 0;

            // ensure list dont include participantAddress
            for(uint j=0; j< rollingList.length; j++) {
                if (rollingList[j] != participantAddress) {
                    remainingParticipants.push(rollingList[j]);
                }
            }
            
            if (rollingList.length > 1) {
                uint random_number = uint256(keccak256(abi.encodePacked(now))) % (remainingParticipants.length);
                participants[participantAddress].secretSanta = remainingParticipants[random_number];
                utils.remove(remainingParticipants[random_number], rollingList);
            } else {
                participants[participantAddress].secretSanta = remainingParticipants[0];
            }
        }

        isOpen = false;
    }
}