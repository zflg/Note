---
title: 区块链基础，以太坊虚拟机
icon: blog
---

## 区块链基础

### 交易（Transactions）

- 区块链是一个全球共享交易数据库
- 创建交易，意味着改变，改变必须保证ACID的。
- 交易由源的一方加密签名

### 块（Blocks）

- 要克服`double-spend attack`，指二次交易的问题，解决的办法是需要标记第一次交易，后面的将会拒绝。
- 在事件上形成线性序列的交易，一个一个的交易块形成了区块链。
- 块可能被还原（这里不是很理解，后面再回来看）

## 以太坊虚拟机

### 账户（Accounts）

- 账户类型：公私钥对控制的**外部账户**，代码控制的**合约账户**
- 每个账户有一个持有化的键值储存，`256-bit=>256-bit`mapping的**storage**
- 每个账户在以太坊里都有**balance**(准确说是Wei,`1 ether = 10^18 wei`)，可以通过交易修改。

### 交易（Transactions）未完成

交易是一个账户到另一个账户的消息，可以是二进制数据（有效荷载）和以太币。

### 气体（Gas）未完成
每一笔交易都会收取一定量的Gas，由交易发起人支付`tx.origin`(像是交税？)

### 储存、内存和堆栈（Storage, Memory and the Stack）
以太坊虚拟机有三个地方可以储存数据：储存、内存和堆栈

- **储存**就是之前说的`256-bit=>256-bit`，读取成本较高，初始化和修改成本更高。合约不能读取和写入自己之外的Storage。
- **内存**是线性的，读取限制为256bit，写入是8bit或者256bit。内存的扩建需要支付gas。
- **堆栈**EVM不是寄存器机而是堆栈机（这里可以了解下这两种工作方式的区别），最大大小1024个元素，每个元素256bit。

### 指令系统

EVM所有指令都是对基本数据类型，256bit或内存片操作。完整的列表可以参见[操作码列表](https://docs.soliditylang.org/en/latest/yul.html#opcodes)。

### Message Calls

### Delegatecall and Libraries

### 日志（Logs）

### 创建（Create）

### 停用或者销毁（Deactivate and Self-destruct）

### 预编译合约（Precompiled Contracts）

## 语言说明

### Solidity源文件布局 （联想）

- SPDX许可证 `// SPDX-License-Identifier: MIT`
- 编译指示
    * 版本编译指示`pragma solidity ^0.5.2;`
    * ABI编码器编译指示 `pragma abicoder v1`,`pragma abicoder v2`
    * SMT检查器 `pragma experimental SMTChecker;`
- 导入入其他源文件
    * `import "filename";`
    * `import * as symbolName from "filename";`, `import "filename" as symbolName;`
    * `import {symbol1 as alias, symbol2} from "filename";`
- 注释
```solidity
// This is a single-line comment.

/*
This is a
multi-line comment.
*/  
  ```

### 合约结构

#### 状态变量
状态变量是其值永久存储在合约存储中的变量。
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract SimpleStorage {
    uint storedData; // State variable
    // ...
}
```
如其中storedData就是状态变量，有点类似于java的class中的成员变量。
#### 函数
函数调用可以在内部或外部发生，并且 对其他合约具有不同级别的可见性。函数接受参数并返回变量以在它们之间传递参数和值
#### 函数修饰符
#### 事件
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.21 <0.9.0;

contract SimpleAuction {
    event HighestBidIncreased(address bidder, uint amount); // Event

    function bid() public payable {
        // ...
        emit HighestBidIncreased(msg.sender, msg.value); // Triggering event
    }
}
```
#### 错误
错误允许您为故障情况定义描述性名称和数据。错误可以用在revert 语句中。与字符串描述相比，错误的成本要低得多，并且允许您对额外数据进行编码。
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// Not enough funds for transfer. Requested `requested`,
/// but only `available` available.
error NotEnoughFunds(uint requested, uint available);

contract Token {
    mapping(address => uint) balances;
    function transfer(address to, uint amount) public {
        uint balance = balances[msg.sender];
        if (balance < amount)
            revert NotEnoughFunds(amount, balance);
        balances[msg.sender] -= amount;
        balances[to] += amount;
        // ...
    }
}
```
#### 结构类型
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Ballot {
    struct Voter { // Struct
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
}
```
#### 枚举
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

contract Purchase {
    enum State { Created, Locked, Inactive } // Enum
}
```
