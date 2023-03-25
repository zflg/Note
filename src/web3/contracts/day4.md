---
title: 类型
icon: blog
---

## 值类型

### 布尔值

- bool

### 整数

- int 可以是int8到int256，int相当于其中的int256
- uint 可以是uint8到uint256，int相当于其中的uint256

#### 位运算

对数字的二进制补码表示执行位运算，如`~int256(0) == int256(-1)`;

#### 移位

移位符号右边的数必须是无符号类型，有符号会产生编译错误
- `x << y`相当于`x * 2**y`
- `x >> y`相当于`x / 2**y`

#### 加减乘

默认会检查所有算术是否溢出，但可以使用[unchecked block](https://docs.soliditylang.org/en/latest/control-structures.html#unchecked)禁用，

#### 除

和众多语言一样，`int(-5) / int(2) = int(-2)`。

#### 模

- `int256(5) % int256(2) == int256(1)`
- `int256(5) % int256(-2) == int256(1)`
- `int256(-5) % int256(2) == int256(-1)`
- `int256(-5) % int256(-2) == int256(-1)`

#### 幂

- `0 ** 0 = 1`
- `x*x*x`比`x ** 3`更Cheaper

### 定点数

Solidity 尚未完全支持定点数。它们可以声明，但不能分配给或分配自。

### 地址

- `address` 包含一个20Byte的值（以太坊地址的大小）
- `address payable` 与address相同，但是由额外成员transfer和send

区别是，`address payable`是一个你可以将以太币发送到的地址，而你不应该将以太币发送到一个普通地址`address`，因为它可能是一个不是为接受以太币而构建的智能合约。

`address payable`可以隐式转换为`address`，但是`address`必须通过`payadble(<address>)`才可以转化为`address payable`。

#### `balance`和`transfer`和`send`

可以使用`balance`查询地址的余额，并使用`transfer`函数将以太币（以wei为单位）发送到支付地址:
```solidity
address payable x = payable(0x123);
address myAddress = address(this);
if (x.balance < 10 && myAddress.balance >= 10) x.transfer(10);
```
`transfer`如果当前合约余额不足或者接受账户拒绝，则`transfer`函数在失败时恢复。
`send`是低级的`transfer`，执行失败不会异常停止，而是返回false。



