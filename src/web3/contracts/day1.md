---
title: 智能合约介绍
icon: blog
---

## 一个简单的智能合约

### 存储示例
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```
可以观察一下大概的结构：
- 版本许可GLPL3.0
- 指定编译版本
- 代码正文

Solidity意义上的合约是驻留在以太坊区块链上的特定地址的代码和数据集合。该示例申明了unit的状态变量，可以通过get和set查询和更改。

### 子货币示例

以上合约没有施加访问限制，现在的示例施加的访问限制示只允许合约的创建者创建新币。

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Coin {
    // The keyword "public" makes variables
    // accessible from other contracts
    address public minter;
    mapping(address => uint) public balances;

    // Events allow clients to react to specific
    // contract changes you declare
    event Sent(address from, address to, uint amount);

    // Constructor code is only run when the contract
    // is created
    constructor() {
        minter = msg.sender;
    }

    // Sends an amount of newly created coins to an address
    // Can only be called by the contract creator
    function mint(address receiver, uint amount) public {
        require(msg.sender == minter);
        balances[receiver] += amount;
    }

    // Errors allow you to provide information about
    // why an operation failed. They are returned
    // to the caller of the function.
    error InsufficientBalance(uint requested, uint available);

    // Sends an amount of existing coins
    // from any caller to an address
    function send(address receiver, uint amount) public {
        if (amount > balances[msg.sender])
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });

        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }
}
```
####minter变量（address类型）
address类型的变量示一个160bit值并且不允许修改，适用于存储合约地址，或者示外部账户的公钥哈希。而public修饰会自动生成一个函数，并允许从合约外部访问这个值。
```solidity
function minter() external view returns (address) { return minter; }
```
####balances变量（mapping类型）
