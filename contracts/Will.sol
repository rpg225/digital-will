// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CreateWill {
    address public owner;

    enum Status {
        NONE,
        ACTIVE,
        CANCELLED,
        EXECUTED
    }

    struct Will {
        address[] beneficiaries;
        uint256[] amounts;
        uint256 createdAt;
        uint256 lastPing;
        uint256 deathTimeout;
        uint256 balance;
        Status status;
    }

    // ✅ NEW: all wills per testator (history)
    mapping(address => Will[]) private willsByTestator;

    // ✅ NEW: 1-based active will id (0 means none)
    mapping(address => uint256) public activeWillId;

    // keep testators list, but prevent duplicates
    address[] public testators;
    mapping(address => bool) private isTestator;

    event WillCreated(
        address indexed testator,
        uint256 indexed willId,
        address[] beneficiaries,
        uint256[] amounts,
        uint256 balance,
        uint256 deathTimeout
    );
    event WillExecuted(address indexed testator, uint256 indexed willId);
    event WillCancelled(address indexed testator, uint256 indexed willId);
    event Ping(address indexed testator, uint256 indexed willId);

    modifier onlyActiveTestator() {
        uint256 id = activeWillId[msg.sender];
        require(id != 0, "No active will");
        Will storage w = willsByTestator[msg.sender][id - 1];
        require(w.status == Status.ACTIVE, "No active will");
        _;
    }

    modifier validWillId(address testator, uint256 willId) {
        require(willId > 0 && willId <= willsByTestator[testator].length, "Invalid willId");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createWill(
        address[] memory _beneficiaries,
        uint256[] memory _amounts,
        uint256 _deathTimeout
    ) external payable returns (uint256 willId) {
        // enforce one ACTIVE will at a time (good UX)
        uint256 current = activeWillId[msg.sender];
        if (current != 0) {
            Will storage prev = willsByTestator[msg.sender][current - 1];
            require(prev.status != Status.ACTIVE, "Will already exists");
        }

        require(msg.value >= 0.01 ether, "Minimum of 0.01 ether required to create will");
        require(_beneficiaries.length == _amounts.length, "Beneficiaries and amount must be of the same length");
        require(_beneficiaries.length > 0 && _beneficiaries.length <= 10, "1 to 10 beneficiaries allowed");

        uint256 total = 0;
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            require(_beneficiaries[i] != address(0), "Beneficiary address must be a valid address");
            require(_amounts[i] > 0, "Amount must be greater than 0");
            total += _amounts[i];
        }
        require(total <= msg.value, "Insufficient ether sent");

        Will memory w = Will({
            beneficiaries: _beneficiaries,
            amounts: _amounts,
            createdAt: block.timestamp,
            lastPing: block.timestamp,
            deathTimeout: _deathTimeout,
            balance: msg.value,
            status: Status.ACTIVE
        });

        willsByTestator[msg.sender].push(w);
        willId = willsByTestator[msg.sender].length; // 1-based
        activeWillId[msg.sender] = willId;

        if (!isTestator[msg.sender]) {
            isTestator[msg.sender] = true;
            testators.push(msg.sender);
        }

        emit WillCreated(msg.sender, willId, _beneficiaries, _amounts, msg.value, _deathTimeout);
    }

    // ✅ Backward-ish: ping active will (no args)
    function ping() external onlyActiveTestator {
        uint256 id = activeWillId[msg.sender];
        Will storage w = willsByTestator[msg.sender][id - 1];

        // FIX: must be AND logic (status check already enforces this)
        w.lastPing = block.timestamp;

        emit Ping(msg.sender, id);
    }

    // ✅ Execute the active will for a testator (keeps your original signature)
    function executeWill(address _testator) external {
        uint256 id = activeWillId[_testator];
        require(id != 0, "No active will");
        _executeWill(_testator, id);
    }

    // ✅ Execute a specific will (new, clean UX)
    function executeWillById(address _testator, uint256 willId)
        external
        validWillId(_testator, willId)
    {
        _executeWill(_testator, willId);
    }

    function _executeWill(address _testator, uint256 willId) internal validWillId(_testator, willId) {
        Will storage w = willsByTestator[_testator][willId - 1];

        require(w.status == Status.ACTIVE, "Will not active");
        require(w.balance != 0, "Will doesn't exist");
        require(block.timestamp > (w.lastPing + w.deathTimeout), "Testator still alive");

        for (uint256 i = 0; i < w.beneficiaries.length; i++) {
            (bool success, ) = payable(w.beneficiaries[i]).call{value: w.amounts[i]}("");
            require(success, "Transfer to beneficiary failed");
        }

        w.status = Status.EXECUTED;
        w.balance = 0;

        if (activeWillId[_testator] == willId) {
            activeWillId[_testator] = 0;
        }

        emit WillExecuted(_testator, willId);
    }

    // ✅ Cancel active will (keeps old UX)
    function cancelWill() external onlyActiveTestator {
        uint256 id = activeWillId[msg.sender];
        _cancelWill(msg.sender, id);
    }

    // ✅ Cancel specific will
    function cancelWillById(uint256 willId) external validWillId(msg.sender, willId) {
        _cancelWill(msg.sender, willId);
    }

    function _cancelWill(address testator, uint256 willId) internal validWillId(testator, willId) {
        Will storage w = willsByTestator[testator][willId - 1];
        require(w.status == Status.ACTIVE, "Will not active");

        uint256 refund = w.balance;
        w.status = Status.CANCELLED;
        w.balance = 0;

        if (activeWillId[testator] == willId) {
            activeWillId[testator] = 0;
        }

        if (refund > 0) {
            (bool success, ) = payable(testator).call{value: refund}("");
            require(success, "Refund failed");
        }

        emit WillCancelled(testator, willId);
    }

    // ---------- Frontend-friendly getters ----------

    function getWillCount(address testator) external view returns (uint256) {
        return willsByTestator[testator].length;
    }

    function getWillById(address testator, uint256 willId)
        external
        view
        validWillId(testator, willId)
        returns (Will memory)
    {
        return willsByTestator[testator][willId - 1];
    }

    // Returns 1..N ids (useful to render a list without scanning events)
    function getMyWillIds() external view returns (uint256[] memory ids) {
        uint256 n = willsByTestator[msg.sender].length;
        ids = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            ids[i] = i + 1;
        }
    }

    function getAllTestators() external view returns(address[] memory) {
        return testators;
    }

    receive() external payable {}
}
