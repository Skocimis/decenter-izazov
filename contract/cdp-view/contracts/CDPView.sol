// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Vat {
    struct Urn {
        uint256 ink;   
        uint256 art;   
    }

    struct Ilk {
        uint256 Art;   
        uint256 rate;  
        uint256 spot;  
        uint256 line;  
        uint256 dust;  
    }

    mapping (bytes32 => mapping (address => Urn )) public urns;
    mapping (bytes32 => Ilk)                       public ilks;
}

abstract contract Manager {
    function ilks(uint) public virtual view returns (bytes32);
    function owns(uint) public virtual view returns (address);
    function urns(uint) public virtual view returns (address);
}

abstract contract DSProxy {
    function owner() public virtual view returns (address);
}    


contract CDPView {
    Manager manager = Manager(0x5ef30b9986345249bc32d8928B7ee64DE9435E39);
    Vat vat = Vat(0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B);
    
    function _getProxyOwner(address owner) external view returns (address userAddr) {
        DSProxy proxy = DSProxy(owner);
        userAddr = proxy.owner();
    }
    
    function getCdpInfo(uint _cdpId) external view
        returns (address urn, address owner, address userAddr, bytes32 ilk, uint collateral, uint debt, uint debtWithInterest) {
        
        ilk = manager.ilks(_cdpId);
        urn = manager.urns(_cdpId);
        owner = manager.owns(_cdpId);
        userAddr = address(0);
        try this._getProxyOwner(owner) returns (address user) {
            userAddr = user;
        } catch {}

        (collateral, debt) = vat.urns(ilk, urn);

        uint rate;
        if (debt == 0) {
            rate = 0;
        } else {
            (, rate, , , ) = vat.ilks(ilk);
        }
        debtWithInterest = (debt * rate) / (10 ** 27);
    }
}
