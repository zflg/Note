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

#### `call`,`delegatecall`和`staticcall`

暂不了解，低级函数，只能作为最后手段，因为破坏了solidity的安全性。

#### `code`和`codehash`

你可以查询任何智能合约的已部署代码。使用`.code`获取EVM字节码作为`bytes memory`,这可能会是空。使用`codehash`获取到Keccak-256哈希。`addr.codehash`比`keccak256(addr.code)`更cheaper。

### 合约类型

- 每个合约都定义了自己的类型。您可以隐式地将合同转换为它们继承自的合同。合同可以显式转换为类型或从`address`类型转换。
- 仅当合同类型具有接收或应付回退功能时，才可能进行`address payable`类型的显式转换。转换使用`address(x)`。如果不具有接收或应付回退功能则使用`payable(address(x))`。更多信息可以参见[address type](https://docs.soliditylang.org/en/latest/types.html#address)
- 如果您声明一个合约类型`MyContract c`的局部变量，您可以调用该合约的函数。注意从具有相同合同类型的地方分配它。
- 您还可以实例化合约（这意味着它们是新创建的）。详情参见'[Contracts via new](https://docs.soliditylang.org/en/latest/control-structures.html#creating-contracts)'
- 合同的数据表示和`address`类型相同，而且这种类型一样可以用到[ABI](https://docs.soliditylang.org/en/latest/abi-spec.html#abi)中
- 合同不支持任何的operators
- 合约类型的成员是合约的外部函数，包括任何标记为`public`的状态变量。
- 对于合同`C`，你可以使用`type(C)`来访问合约相关的[type information](https://docs.soliditylang.org/en/latest/units-and-global-variables.html#meta-type)

### 固定大小字节数组

值类型`bytes1`, `bytes2`, `bytes3`, …`bytes32` 包含从1到最多32的字节序列。类型`bytes1[]`是一个字节数组，但由于填充规则，它为每个元素浪费了31个字节的空间（存储中除外）。最好改用`bytes`类型。`.length`是字节数组的固定长度（ready-only）。

### 动态大小的字节数组

- bytes 动态大小的字节数组
- string 动态大小的UTF-8编码的string。

### 地址字面量

例如，通过地址校验和测试的十六进制字面量`0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF`是`address`类型。长度在39到 41位之间且未通过校验和测试的十六进制字面量会产生错误。您可以在前面（对于整数类型）或附加（对于 bytesNN 类型）零来消除错误。

### 有理数和整数字面量

- 不存在八进制，存在10进制和16进制，如`100`,`0x64`
- `.1`和`1.3`有效，`1.`无效
- 科学技术法有效，形式如`MeE`相当于`M * 10**E`。如`2e10`, `-2e10`, `2e-10`, `2.5e1`
- 可以`_`分割提高可读性，如`123_000`, `0x2efff_abde`

数字字面量表达式保留任意精度，直到它们被转换为非字面量类型（即通过将它们与数字字面量表达式（如布尔字面量）以外的任何内容一起使用或通过显式转换）。这意味着计算不会溢出并且除法不会在数字字面量表达式中截断。如`(2**800 + 1) - 2**800`结果为常量`1`，尽管中间产生了一个超字长的中间值。此外`.5 * 8`的结果是整数`4`尽管中间使用了非整数。

只要操作数是整数，任何可以应用于整数的运算符也可以应用于数字字面量表达式。如果两者中的任何一个是小数，则不允许进行位运算，并且如果指数是小数则不允许求幂（因为这可能会导致非有理数）。

### 字符串字面量和类型

字符串可以用双引号或者单引号书写（`"foo"`or`'bar'`），并且可以被分割成多个部分（`"foo""bar"`相当于`"foobar"`），这在处理长字符串的时候会很有用。没有0尾随，，如`"foo"`是3个字节而不是4。和整数字元一样。他们可以变换，但是他们可以隐式的转换为`bytes1`...`bytes32`，如果合适则可以转换为`bytes`和`string`

字符串字面量只能包含可打印的 ASCII 字符，这意味着介于 0x20 .. 0x7E 之间并包括在内的字符。

字符串字面量支持转义字符，`\xNN`采用十六进制值并插入适当的字节，同时`\uNNNN`采用Unicode代码点并插入UTF-8序列。

### unicode字面量

虽然常规字符串字面量只能包含ASCII，但Unicode字面量（以关键字为前缀unicode）可以包含任何有效的UTF-8序列。它们还支持与常规字符串字面量完全相同的转义序列。
```solidity
string memory a = unicode"Hello ð";
```

### 十六进制字面量

- `hex"001122FF"`相当于`hex"0011_22_ff"`
- `hex"00112233" hex"44556677"`相当于`hex"0011223344556677"`

### 枚举

枚举是在 Solidity 中创建用户定义类型的一种方式。它们可以显式转换为所有整数类型，但不允许隐式转换。从整数的显式转换会在运行时检查值是否位于枚举范围内，否则会导致 Panic 错误。枚举至少需要一个成员，声明时的默认值是第一个成员。枚举不能超过 256 个成员。

使用`type(NameOfEnum).min`和`type(NameOfEnum).max`可以获得给定枚举的最小值和最大值。

### 用户定义的值类型

用户定义的值类型允许在基本值类型上创建零成本抽象。这类似于别名，但具有更严格的类型要求。

该类型没有任何运算符或附加的成员函数。特别是，连运算符都`==`没有定义。不允许与其他类型进行显式和隐式转换

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.8;

// Represent a 18 decimal, 256 bit wide fixed point type using a user-defined value type.
type UFixed256x18 is uint256;

/// A minimal library to do fixed point operations on UFixed256x18.
library FixedMath {
    uint constant multiplier = 10**18;

    /// Adds two UFixed256x18 numbers. Reverts on overflow, relying on checked
    /// arithmetic on uint256.
    function add(UFixed256x18 a, UFixed256x18 b) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(UFixed256x18.unwrap(a) + UFixed256x18.unwrap(b));
    }
    /// Multiplies UFixed256x18 and uint256. Reverts on overflow, relying on checked
    /// arithmetic on uint256.
    function mul(UFixed256x18 a, uint256 b) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(UFixed256x18.unwrap(a) * b);
    }
    /// Take the floor of a UFixed256x18 number.
    /// @return the largest integer that does not exceed `a`.
    function floor(UFixed256x18 a) internal pure returns (uint256) {
        return UFixed256x18.unwrap(a) / multiplier;
    }
    /// Turns a uint256 into a UFixed256x18 of the same value.
    /// Reverts if the integer is too large.
    function toUFixed256x18(uint256 a) internal pure returns (UFixed256x18) {
        return UFixed256x18.wrap(a * multiplier);
    }
}
```

### 函数

函数表示为：
```solidity
function (<parameter types>) {internal|external} [pure|view|payable] [returns (<return types>)]
```

- 与参数类型相反，返回类型不能为空 - 如果函数类型不应返回任何内容，整个`returns (<return types>)`部分需要省略。
- 默认情况下，函数类型是内部的，内部函数只能在当前合约内部调用，因此`internal`关键字可以省略。请注意，这仅适用于函数类型。必须为合约中定义的函数明确指定可见性，它们没有默认值。
- 转换（没理解这里的转换什么意思）
    * `pure`函数可以转换为`view`和`non-payable`函数
    * `view`函数可以转换为`non-payable`函数
    * `payable`函数可以转换为`non-payable`函数
- 成员
    * `.address`返回函数合约的地址
    * `.selector`返回ABI函数选择器
    
例子：
如何使用成员
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.4 <0.9.0;

contract Example {
    function f() public payable returns (bytes4) {
        assert(this.f.address == address(this));
        return this.f.selector;
    }

    function g() public {
        this.f{gas: 10, value: 800}();
    }
}
```
如何使用内部函数类型
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

library ArrayUtils {
    // internal functions can be used in internal library functions because
    // they will be part of the same code context
    function map(uint[] memory self, function (uint) pure returns (uint) f)
        internal
        pure
        returns (uint[] memory r)
    {
        r = new uint[](self.length);
        for (uint i = 0; i < self.length; i++) {
            r[i] = f(self[i]);
        }
    }

    function reduce(
        uint[] memory self,
        function (uint, uint) pure returns (uint) f
    )
        internal
        pure
        returns (uint r)
    {
        r = self[0];
        for (uint i = 1; i < self.length; i++) {
            r = f(r, self[i]);
        }
    }

    function range(uint length) internal pure returns (uint[] memory r) {
        r = new uint[](length);
        for (uint i = 0; i < r.length; i++) {
            r[i] = i;
        }
    }
}


contract Pyramid {
    using ArrayUtils for *;

    function pyramid(uint l) public pure returns (uint) {
        return ArrayUtils.range(l).map(square).reduce(sum);
    }

    function square(uint x) internal pure returns (uint) {
        return x * x;
    }

    function sum(uint x, uint y) internal pure returns (uint) {
        return x + y;
    }
}
```
如何使用外部函数类型
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract Oracle {
    struct Request {
        bytes data;
        function(uint) external callback;
    }

    Request[] private requests;
    event NewRequest(uint);

    function query(bytes memory data, function(uint) external callback) public {
        requests.push(Request(data, callback));
        emit NewRequest(requests.length - 1);
    }

    function reply(uint requestID, uint response) public {
        // Here goes the check that the reply comes from a trusted source
        requests[requestID].callback(response);
    }
}

contract OracleUser {
    Oracle constant private ORACLE_CONST = Oracle(address(0x00000000219ab540356cBB839Cbe05303d7705Fa)); // known contract
    uint private exchangeRate;

    function buySomething() public {
        ORACLE_CONST.query("USD", this.oracleResponse);
    }

    function oracleResponse(uint response) public {
        require(
            msg.sender == address(ORACLE_CONST),
            "Only oracle can call this."
        );
        exchangeRate = response;
    }
}
```