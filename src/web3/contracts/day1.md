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
#### minter变量（address类型）
address类型的变量示一个160bit值并且不允许修改，适用于存储合约地址，或者示外部账户的公钥哈希。而public修饰会自动生成一个函数，并允许从合约外部访问这个值。
```solidity
function minter() external view returns (address) { return minter; }
```
#### balances变量（mapping类型）
`mapping(address => uint) public balances;`也创建了一个mapping的类型将地址映射到unsigned integers。
mapping可以看作一个key-to-value的hash表。而public同样暴露给外部账户一个函数
```solidity
function balances(address account) external view returns (uint) { return balances[account]; }
```
#### event事件
`event Sent(address from, address to, uint amount);`声明了一个事件，一旦发出。则以太坊客户端就可以侦听这些事件。可以使用JS代码，web3.js创建Coin合约对象，任何外界用户都会调用balances上自动生成的函数：
```javascript
Coin.Sent().watch({}, '', function(error, result) {
    if (!error) {
        console.log("Coin transfer: " + result.args.amount +
            " coins were sent from " + result.args.from +
            " to " + result.args.to + ".");
        console.log("Balances now:\n" +
            "Sender: " + Coin.balances.call(result.args.from) +
            "Receiver: " + Coin.balances.call(result.args.to));
    }
})
```
#### 构造函数
`constructor() { minter = msg.sender; }`，在合约创建过程执行，之后无法调用。之后永久储存合同人的地址。其中`msg`（`tx`和`block`也是）是一个特殊全局变量，其中可以渠道访问区块链的属性。msg.sender始终都是当前（外部）函数调用的来源地之。
#### mint函数
根据之前的constructor函数，则该合约的创建者地址记录在了minter变量当中，调用mint其中`require(msg.sender == minter)`，表示当前mint函数的调用地址必须等于合约的创建地址。这里balances有个溢出的默认check算法，balances是unit的映射，如果unit值在操作中溢出`>2^256 -1`则也会回滚事务。这里的逻辑我理解相当于铸币。
#### send函数
首先，由于没有检查，所以所有人都可以调用这个方法（我理解是这是转调用者自己的钱给别人，当然所有人都可以调用这个方法）。但是check了需要send的amount是否大于当前调用者的余额，真则revert操作，`InsufficientBalance`相当于抛错。




