pragma solidity ^0.5.1;

library utils {
    function remove(address _address, address[] storage list) public {
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
    }
}

contract secretSantaFactory {
  address private admin = msg.sender;
  struct SecretSantaEvent {
    string name;
    address owner;
    address contractAdress;
    uint creationTime;
  }

  mapping (address => SecretSantaEvent) secretSantaEvents;
  address[] public secretSantaAddresses;

  function getSecretSantaEvents() view public returns(address [] memory) {
    return secretSantaAddresses;
  }
  
  function getSecretSantaEvent(address _address) view public returns(address, address,string memory, uint) {
    return (secretSantaEvents[_address].contractAdress, secretSantaEvents[_address].owner, secretSantaEvents[_address].name, secretSantaEvents[_address].creationTime);
  }
  
  function removeSecretSantaEvent(address addressToBeDeleted) public {
    require(secretSantaEvents[addressToBeDeleted].owner == msg.sender || admin == msg.sender, 'Insufficient priviledge.');
    utils.remove(addressToBeDeleted, secretSantaAddresses);
    delete secretSantaEvents[addressToBeDeleted];
  }

  function newSecretSantaEvent(string memory _name) public {
    address contractAdress = address(new SecretSanta(msg.sender));

    SecretSantaEvent storage secretSantaEvent = secretSantaEvents[contractAdress];
    secretSantaEvent.name = _name;
    secretSantaEvent.contractAdress = contractAdress;
    secretSantaEvent.owner = msg.sender;
    secretSantaEvent.creationTime = now;
        
    secretSantaAddresses.push(contractAdress) -1;
  }
}

contract SecretSanta {
    address private owner;
    bool public isOpen = true;

    struct Participant {
        string name;
        string wishlist;
        address secretSanta;
        uint index;
    }
    
    constructor(address _address) public {
        owner = _address;
    }
    
    mapping (address => Participant) participants;
    address[] public participantAccts;
    address[] private remainingParticipants;
    mapping (address => bool) Rolled;
    
    function register(string memory _name, string memory _wishlist) public {
        require(isOpen, 'Registration is over.');
        
        Participant storage participant = participants[msg.sender];
        participant.name = _name;
        participant.wishlist = _wishlist;
        
        participantAccts.push(msg.sender) -1;
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
    
    function getEventStatus() view public returns(uint, bool) {
        return (participantAccts.length, isOpen);
    }
    
    function getParticpant(address _address) view public returns (string memory, string memory) {
        require(owner == msg.sender, 'Insufficient priviledge.');

        return (participants[_address].name, participants[_address].wishlist);
    }
    
    function deleteParticpant(address addressToBeDeleted) public {
        require(owner == msg.sender, 'Insufficient priviledge.');
        utils.remove(addressToBeDeleted, participantAccts);
        delete participants[addressToBeDeleted];
    }
    
    function closeRegistration() public {
        require(owner == msg.sender, 'Insufficient priviledge.');
        require(participantAccts.length > 1, 'Need more participants.');

        
        for (uint i=0; i<participantAccts.length; i++) {
            address participantAddress = participantAccts[i];
            remainingParticipants.length = 0;
            
            for(uint j=0; j< participantAccts.length; j++) {
                if (participantAccts[j] != participantAddress && !Rolled[participantAccts[j]]) {
                    remainingParticipants.push(participantAccts[j]);
                }
            }
            
            if (remainingParticipants.length > 1) {
                uint random_number = uint256(keccak256(abi.encodePacked(now))) % (remainingParticipants.length - 1) + 1;
                participants[participantAddress].secretSanta = remainingParticipants[random_number];
                Rolled[remainingParticipants[random_number]]=true;
            } else {
                participants[participantAddress].secretSanta = remainingParticipants[0];
                Rolled[remainingParticipants[0]]=true;
            }
        }

        isOpen = false;
    }
}