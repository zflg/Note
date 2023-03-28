---
title: 类型
icon: blog
headerDepth: 4
---

## 引用类型

引用类型包括结构、数组和映射。如果使用引用类型，必须显示的提供储存类型的数据区：
- memory 其神明周期仅限于外部函数调用
- storage 储存状态变量的位置，生命周期仅限于合约的声明周期
- calldata 是一个不可修改的、非持久性的区域，函数参数存储在其中，其行为主要类似于内存

更改数据位置的分配或类型转换将始终引发自动复制操作，而同一数据位置内的分配在某些情况下仅复制存储类型。

### 数据位置和分配行为

数据位置不仅与数据的持久性相关，而且与分配的语义相关：

- `storage`和`memory`（或来自`calldata`）之间的分配总是创建一个独立的副本。
- 从`memory`到`memory`的赋值仅创建引用。这意味着对一个内存变量的更改在引用相同数据的所有其他内存变量中也是可见的。
- `storage`对本地存储变量的赋值也只分配一个引用。
- 始终复制所有其他分配`storage`。这种情况的示例是对状态变量或存储结构类型的局部变量成员的赋值，即使局部变量本身只是一个引用。
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract C {
    // The data location of x is storage.
    // This is the only place where the
    // data location can be omitted.
    uint[] x;

    // The data location of memoryArray is memory.
    function f(uint[] memory memoryArray) public {
        x = memoryArray; // works, copies the whole array to storage
        uint[] storage y = x; // works, assigns a pointer, data location of y is storage
        y[7]; // fine, returns the 8th element
        y.pop(); // fine, modifies x through y
        delete x; // fine, clears the array, also modifies y
        // The following does not work; it would need to create a new temporary /
        // unnamed array in storage, but storage is "statically" allocated:
        // y = memoryArray;
        // Similarly, "delete y" is not valid, as assignments to local variables
        // referencing storage objects can only be made from existing storage objects.
        // It would "reset" the pointer, but there is no sensible location it could point to.
        // For more details see the documentation of the "delete" operator.
        // delete y;
        g(x); // calls g, handing over a reference to x
        h(x); // calls h and creates an independent, temporary copy in memory
    }

    function g(uint[] storage) internal pure {}
    function h(uint[] memory) public pure {}
}
```

### 数组

- 固定k大小的数组写为`T[k]`，动态大小的数组写为`T[]`。
- 访问超出其末尾的数组会导致断言失败。方法`.push()`和`.push(value)`可用于在动态大小数组的末尾追加一个新元素，其中`.push()`追加一个零初始化元素并返回对其的引用。
- 动态大小的数组只能在存储中调整大小。在内存中，这样的数组可以是任意大小，但一旦分配了数组，就不能更改大小。

#### bytes and string as Arrays

`bytes`和`string`类型的变量是特殊数组。类型`bytes`类似于`bytes1[]`，但它在`calldata`和`memory`中被紧紧地打包。`string`等于`bytes`但不允许长度或索引访问。

Solidity没有stringd的操作函数，但是有第三方的string包，你可以使用`keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2))`判断两个`string`相等，使用`string.concat(s1, s2)``链接两个string`

`bytes`比`bytes1[]`更cheaper，因为`bytes1[]`在`memory`中会添加31个填充字节，但在`storage`中不会填充。

#### The functions bytes.concat and string.concat

可以使用`string.concat`连接任意数量的`string`。这个方法返回一个`string memory`数组并且不被填充。

类似的，`bytes.concat`函数可以连接任意数量的`bytes`。

例：
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract C {
    string s = "Storage";
    function f(bytes calldata bc, string memory sm, bytes16 b) public view {
        string memory concatString = string.concat(s, string(bc), "Literal", sm);
        assert((bytes(s).length + bc.length + 7 + bytes(sm).length) == bytes(concatString).length);

        bytes memory concatBytes = bytes.concat(bytes(s), bc, bc[:2], "Literal", bytes(sm), b);
        assert((bytes(s).length + bc.length + 2 + 7 + bytes(sm).length + b.length) == concatBytes.length);
    }
}
```
#### Allocating Memory Arrays

具有动态长度的内存数组可以使用`new`操作符来创建。与存储数组不同的是，不可能调整内存数组的大小（例如，不能使用`.push`成员函数）。你必须事先计算出所需的大小，或者创建一个新的内存数组并复制每个元素。

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f(uint len) public pure {
        uint[] memory a = new uint[](7);
        bytes memory b = new bytes(len);
        assert(a.length == 7);
        assert(b.length == len);
        a[6] = 8;
    }
}
```

#### Array Literals

数组的基本类型是列表中第一个表达式的类型，这样所有其他表达式都可以隐式转换为它。如果这不可能，则为类型错误。

在下面的例子中，`[1, 2, 3]`的类型是`uint8[3]`内存，因为这些常数的类型都是`uint8`。如果你希望结果是`uint[3]`内存类型，你需要将第一个元素转换为`uint`。
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure {
        g([uint(1), 2, 3]);
    }
    function g(uint[3] memory) public pure {
        // ...
    }
}
```
数组字面量`[1, -1]`是无效的，因为第一个表达式的类型是`uint8`，而第二个表达式的类型是`int8`，它们不能互相隐式转换。例如，为了使其工作，你可以使用`[int8(1), -1]`。

由于不同类型的固定大小的内存数组不能相互转换（即使基本类型可以），如果你想使用二维数组字面，你总是必须明确指定一个共同的基本类型：
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure returns (uint24[2][4] memory) {
        uint24[2][4] memory x = [[uint24(0x1), 1], [0xffffff, 2], [uint24(0xff), 3], [uint24(0xffff), 4]];
        // The following does not work, because some of the inner arrays are not of the right type.
        // uint[2][4] memory x = [[0x1, 1], [0xffffff, 2], [0xff, 3], [0xffff, 4]];
        return x;
    }
}
```
固定大小的内存数组不能分配给动态大小的内存数组，也就是说，以下情况是不可能的：
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.0 <0.9.0;

// This will not compile.
contract C {
    function f() public {
        // The next line creates a type error because uint[3] memory
        // cannot be converted to uint[] memory.
        uint[] memory x = [uint(1), 3, 4];
    }
}
```

计划在将来取消这一限制，但由于ABI中数组的传递方式，它产生了一些复杂的问题。

如果你想初始化动态大小的数组，你必须分配各个元素：

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract C {
    function f() public pure {
        uint[] memory x = new uint[](3);
        x[0] = 1;
        x[1] = 3;
        x[2] = 4;
    }
}
```

#### Array Members

- length: 数组有一个`length`成员，包含它们的元素数量。一旦它们被创建,内存数组的长度是固定的（但也是动态的，即它可以取决于运行时参数）。
- push(): 动态存储数组和字节（不是字符串）有一个叫做`push()`的成员函数，你可以用它来在数组的末端追加一个零初始化的元素。它返回一个对该元素的引用，因此可以像`x.push().t=2`或`x.push()=b`那样使用它。
- push(x): 动态存储数组和字节（不是字符串）有一个叫做`push(x)`的成员函数，你可以用它来在数组的末端追加一个给定的元素。该函数不返回任何东西。
- pop(): 动态存储数组和字节（不是字符串）有一个叫做`pop()`的成员函数，你可以用它来从数组的末端移除一个元素。这也隐含地对被移除的元素调用`delete`。该函数不返回任何东西。
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

contract ArrayContract {
    uint[2**20] aLotOfIntegers;
    // Note that the following is not a pair of dynamic arrays but a
    // dynamic array of pairs (i.e. of fixed size arrays of length two).
    // In Solidity, T[k] and T[] are always arrays with elements of type T,
    // even if T itself is an array.
    // Because of that, bool[2][] is a dynamic array of elements
    // that are bool[2]. This is different from other languages, like C.
    // Data location for all state variables is storage.
    bool[2][] pairsOfFlags;

    // newPairs is stored in memory - the only possibility
    // for public contract function arguments
    function setAllFlagPairs(bool[2][] memory newPairs) public {
        // assignment to a storage array performs a copy of ``newPairs`` and
        // replaces the complete array ``pairsOfFlags``.
        pairsOfFlags = newPairs;
    }

    struct StructType {
        uint[] contents;
        uint moreInfo;
    }
    StructType s;

    function f(uint[] memory c) public {
        // stores a reference to ``s`` in ``g``
        StructType storage g = s;
        // also changes ``s.moreInfo``.
        g.moreInfo = 2;
        // assigns a copy because ``g.contents``
        // is not a local variable, but a member of
        // a local variable.
        g.contents = c;
    }

    function setFlagPair(uint index, bool flagA, bool flagB) public {
        // access to a non-existing index will throw an exception
        pairsOfFlags[index][0] = flagA;
        pairsOfFlags[index][1] = flagB;
    }

    function changeFlagArraySize(uint newSize) public {
        // using push and pop is the only way to change the
        // length of an array
        if (newSize < pairsOfFlags.length) {
            while (pairsOfFlags.length > newSize)
                pairsOfFlags.pop();
        } else if (newSize > pairsOfFlags.length) {
            while (pairsOfFlags.length < newSize)
                pairsOfFlags.push();
        }
    }

    function clear() public {
        // these clear the arrays completely
        delete pairsOfFlags;
        delete aLotOfIntegers;
        // identical effect here
        pairsOfFlags = new bool[2][](0);
    }

    bytes byteData;

    function byteArrays(bytes memory data) public {
        // byte arrays ("bytes") are different as they are stored without padding,
        // but can be treated identical to "uint8[]"
        byteData = data;
        for (uint i = 0; i < 7; i++)
            byteData.push();
        byteData[3] = 0x08;
        delete byteData[2];
    }

    function addFlag(bool[2] memory flag) public returns (uint) {
        pairsOfFlags.push(flag);
        return pairsOfFlags.length;
    }

    function createMemoryArray(uint size) public pure returns (bytes memory) {
        // Dynamic memory arrays are created using `new`:
        uint[2][] memory arrayOfPairs = new uint[2][](size);

        // Inline arrays are always statically-sized and if you only
        // use literals, you have to provide at least one type.
        arrayOfPairs[0] = [uint(1), 2];

        // Create a dynamic byte array:
        bytes memory b = new bytes(200);
        for (uint i = 0; i < b.length; i++)
            b[i] = bytes1(uint8(i));
        return b;
    }
}
```

#### Dangling References to Storage Array Elements(悬挂引用)

使用存储阵列时，您需要注意避免悬挂引用。悬空引用是指向不再存在或已移动但未更新引用的引用。例如，如果将对数组元素的引用存储在局部变量中，然后.pop()从包含的数组中存储，则可能会出现悬挂引用：
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract C {
    uint[][] s;

    function f() public {
        // Stores a pointer to the last array element of s.
        uint[] storage ptr = s[s.length - 1];
        // Removes the last array element of s.
        s.pop();
        // Writes to the array element that is no longer within the array.
        ptr.push(0x42);
        // Adding a new element to ``s`` now will not add an empty array, but
        // will result in an array of length 1 with ``0x42`` as element.
        s.push();
        assert(s[s.length - 1][0] == 0x42);
    }
}
```
写入`ptr.push(0x42)`将不会恢复，尽管事实上`ptr`不再引用`s`的有效元素。由于编译器假定未使用的存储始终为零，因此后续`s.push()`不会显式地将零写入存储，所以在`push()`之后`s`的最后一个元素将有长度`1`并且包含`0x42`作为其第一元素。

注意，Solidity 不允许在存储中声明对值类型的引用。这类明确的悬空引用被限制在嵌套引用类型中。然而，当在元组赋值中使用复杂表达式时，悬空引用也会暂时发生：
```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract C {
    uint[] s;
    uint[] t;
    constructor() {
        // Push some initial values to the storage arrays.
        s.push(0x07);
        t.push(0x03);
    }

    function g() internal returns (uint[] storage) {
        s.pop();
        return t;
    }

    function f() public returns (uint[] memory) {
        // The following will first evaluate ``s.push()`` to a reference to a new element
        // at index 1. Afterwards, the call to ``g`` pops this new element, resulting in
        // the left-most tuple element to become a dangling reference. The assignment still
        // takes place and will write outside the data area of ``s``.
        (s.push(), g()[0]) = (0x42, 0x17);
        // A subsequent push to ``s`` will reveal the value written by the previous
        // statement, i.e. the last element of ``s`` at the end of this function will have
        // the value ``0x42``.
        s.push();
        return s;
    }
}
```


## 基本类型之间的转换

### 隐式转换

- `unit8`可以转化为`unit16`，`int8`可以转化`int256`。
- `int8`不能转化为`uint256`

```solidity
uint8 y;
uint16 z;
uint32 x = y + z;
```

### 显式转换

- 将整数转化为更小的类型截取左侧
```solidity
uint32 a = 0x12345678;
uint16 b = uint16(a); // 此时 b 的值是 0x5678
```
- 将整数转换为更大的类型左侧填充
```solidity
uint16 a = 0x1234;
uint32 b = uint32(a); // b 为 0x00001234 now
```
- 定长字节转换为更短的截取右侧
```solidity
bytes2 a = 0x1234;
bytes1 b = bytes1(a); // b 为 0x12
```
- 定长字节转换为更长的右侧填充
```solidity
bytes2 a = 0x1234;
bytes4 b = bytes4(a); // b 为 0x12340000
```

例：
```solidity
bytes2 a = 0x1234;
uint32 b = uint16(a);           // b 为 0x00001234
uint32 c = uint32(bytes4(a));   // c 为 0x12340000
uint8 d = uint8(uint16(a));     // d 为 0x34
uint8 e = uint8(bytes1(a));     // e 为 0x12
```

## 字面常量与基本类型的转换

### 整型与字面常量转换

十进制和十六进制字面常量可以隐式转换为任何足以表示它而不会截断的整数类型 ：
```solidity
uint8 a = 12; //  可行
uint32 b = 1234; // 可行
uint16 c = 0x123456; // 失败, 会截断为 0x3456
```

### 定长字节数组与字面常量转换

- 10进制不能隐式转换为定长字节数组，16进制可以
- 大小必须完全符合定长字节数组

```solidity
bytes2 a = 54321; // 不可行
bytes2 b = 0x12; // 不可行
bytes2 c = 0x123; // 不可行
bytes2 d = 0x1234; // 可行
bytes2 e = 0x0012; // 可行
bytes4 f = 0; // 可行
bytes4 g = 0x0; // 可行


bytes2 a = hex"1234"; // 可行
bytes2 b = "xy"; // 可行
bytes2 c = hex"12"; // 不可行
bytes2 d = hex"123"; // n不可行
bytes2 e = "x"; // 不可行
bytes2 f = "xyz"; // 不可行
```

### 地址类型

- `bytes20`和`unit160`可以显式转换为`address payable`类型
- 一个地址`address a`可以通过`payable(a)`转换为`address payable`类型




