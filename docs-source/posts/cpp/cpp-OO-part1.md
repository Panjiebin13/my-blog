## 隐含的this
你定义的成员函数如下
```cpp
// 成员函数定义（通常在 .cpp 文件中）
bool Stack::push(int i) {
    if (top == STACK_SIZE-1) {
        cout << "Stack is overflow.\n";
        return false;
    } else {
        top++;
        buffer[top] = i;
        return true;
    }
}
```
但是实际上会有一个隐含的参数this，在底层会被编译器自动转换
```cpp
bool push(Stack * const this, int i) {
    if (this->top == STACK_SIZE-1) {
        cout << "Stack is overflow.\n";
        return false;
    }
    this->top++;
    this->buffer[this->top] = i;
    return true;
}
```

> 面向对象写类时，应该在头文件中声明，源文件中定义

例如：
Stack.h
```cpp
#ifndef STACK_H //防止重复声明，如果在多个源文件中引入不会出问题吗？
#define STACK_H

class Stack {
private:
    int top;
    static const int SIZE = 100;
    int buffer[SIZE];
public:
    Stack();
    bool push(int i);   // 声明
    bool pop(int& i);   // 声明
};

#endif
```
Stack.cpp
```cpp
#include "Stack.h"
#include <iostream>

Stack::Stack() : top(-1) {} //定义构造函数

bool Stack::push(int i) {
    if (top == SIZE - 1) {
        std::cout << "Stack overflow\n";
        return false;
    }
    buffer[++top] = i;
    return true;
}

bool Stack::pop(int& i) {
    if (top == -1) {
        std::cout << "Stack empty\n";
        return false;
    }
    i = buffer[top--];
    return true;
}
```
每个cpp被看作一个独立的编译单元，类的定义允许在不同编译单元中出现
## 在类中定义的函数会被内联
a.h

```cpp
#ifndef TDATE_H
#define TDATE_H

class TDate {
public:
    void SetDate(int y, int m, int d) {
        year = y; month = m; day = d;
    }
    bool IsLeapYear() const {  // 建议加 const
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }
private:
    int year, month, day;
};

#endif
```
如果这么写，类内定义的函数默认为 inline，编译器尝试将其“展开”以提高性能。但不是强制内联，最终由**编译器决定**。

这里还有两个核心概念：
1. ADT（Abstract Data Type，抽象数据类型）:只暴露接口，隐藏实现
2. value(值语义）：对象的行为像 int、double 等基本类型一样：拷贝的是“值”，不是“地址”


| 类型     | 示例                        | 行为                                               |
|----------|-----------------------------|----------------------------------------------------|
| 值语义   | `int a = 5; int b = a;`     | `b` 是 `a` 的独立副本，改 `b` 不影响 `a`          |
| 引用语义 | `int* p = &a; int* q = p;`  | `q` 和 `p` 指向同一个对象，改 `*q` 会影响 `*p`    |


```cpp
TDate t1;
t1.SetDate(2025, 1, 1);

TDate t2 = t1;   // 拷贝构造：t2 是 t1 的副本
t2.SetDate(2026, 1, 1);

// 此时：
// t1 仍是 2025-01-01
// t2 是 2026-01-01
// 两者互不影响！
```
这一点与Java相反
## 构造函数
| 特性       | 说明                                                                 |
|------------|----------------------------------------------------------------------|
| 与类同名   | 函数名必须和类名一样（如 `TDate::TDate()`）                          |
| 无返回类型 | 不写 `void` 或其他类型，连 `return` 都不能有                         |
| 自动调用   | 创建对象时由编译器自动调用，不能像普通函数那样手动调用               |
| 可重载     | 可以有多个构造函数，只要参数列表不同                                 |

例：

```cpp
class TDate {
public:
    TDate();                        // 默认构造函数
    TDate(int y, int m, int d);     // 带参构造函数
    TDate(const TDate& other);      // 拷贝构造函数
};
```
（需要在源文件中具体定义）

注意下，和java的构造函数不太一样，不需要用new，否则就是建在堆上。
```cpp
TDate t1;           // 调用默认构造函数
TDate t2(2025,1,1); // 调用带参构造函数
TDate t3 = t2;      // 调用拷贝构造函数
```
- 一旦你定义了任意构造函数，编译器就不再提供默认构造函数！
  如果想保留默认构造函数，可以用如下两个方法。
    - 方法一：显式声明并定义


		```cpp
		class TDate {
		public:
		    TDate() {}                    // 显式提供默认构造函数
		    TDate(int y, int m, int d) {  // 其他构造函数
		        year = y; month = m; day = d;
		    }
		};
		```
	- 方法二：使用default
	

		```cpp
		class TDate {
		public:
		    TDate() = default;            // 编译器生成默认行为
		    TDate(int y, int m, int d) {
		        year = y; month = m; day = d;
		    }
		};
		```
- 还可以用delete禁用默认构造函数

  ```cpp
  class TDate {
  public:
      TDate() = delete;             // 禁止默认构造
      TDate(int y, int m, int d);   // 只允许带参构造
  };
  ```
- 可以将构造函数私有化（实现单件模式等等）
  ```cpp
  class singleton {
  protected:
      singleton() {}
      singleton(const singleton &);
  public:
      static singleton * instance() {
          return m_instance == NULL ?
                 m_instance = new singleton : m_instance;
      }
      static void destroy() {
          delete m_instance;
          m_instance = NULL;
      }
  private:
      static singleton * m_instance;
  };
  
  singleton * singleton::m_instance = NULL;
  ```
## 析构函数
- ~<类名>()
- 对象消亡时,系统自动调用

- public，可定义为private

### 例子：
```cpp
class A {
public:
    A();              // 构造函数
    ~A();             // 析构函数 ← 注意波浪线 ~
private:
    // ...
};
```
### 析构函数的作用，用来释放对象持有的“外部资源”
例如：new出来的堆上资源

```cpp
class A {
private:
    int* data;
    //如果是int data[100];  栈上数组，或作为对象的一部分，就不需要额外写析构函数，用默认的即可
public:
    A() {
        data = new int[100];  // 分配内存
    }
    ~A() {                    // 析构函数
        delete[] data;        // 释放内存
    }
};
```
### 析构函数的调用时机
| 场景                     | 是否调用析构函数？ | 说明                             |
|--------------------------|--------------------|----------------------------------|
| 局部对象离开作用域       | ✅ 是              | 如 `main()` 中的 `A a;`         |
| 全局对象程序结束         | ✅ 是              | 在 `main()` 返回前调用           |
| 动态对象 `delete p;`     | ✅ 是              | 手动删除时调用                   |
| 指针指向的对象未释放     | ❌ 否              | 只有 `delete` 才会触发           |

最后一点需要额外注意：
new出来的对象一定要手动delete,栈上对象要不要手动delete？一定不能！！！delete只能用于指针，释放指针指向的对象。
```cpp
A* p = new A;  // 创建对象
// ...
delete p;      // 删除对象 → 调用 ~A()，一定要手动释放
```
### 析构函数可以置为private，但是不要使用delete this
例如如下例子
```cpp
class A {
public:
    void destroy() { delete this; }  // ← 在对象内部删除自己
private:
    ~A();  // 析构函数私有，防止外部直接 delete
};

int main() {
    A* p = new A;
    p->destroy();  // 调用 delete this
    // 此时 p 指向的内存已被释放！但是p指针仍然指向原来那段空间
}
```
推荐使用（更显眼一点，但是其实也没有本质上解决问题）

```cpp
class A {
private:
    ~A();  // 析构函数私有
public:
    static void free(A* p) {
        delete p;  // 在类外部（但仍是类作用域内）执行 delete
    }
};

int main() {
    A* p = new A;
    A::free(p);  // 明确释放
}
```
### GC vs RAII
- Java 的方式：GC（Garbage Collection）
    - 自动回收不再使用的对象
    - 优点：程序员不用关心内存
    - 缺点：性能开销大,无法精确控制释放时机；有些时候不能自动垃圾回收，比如与数据库的连接。

- C++ 的方式：RAII（Resource Acquisition Is Initialization）
  资源获取即初始化 —— 资源的获取和释放绑定到对象的生命周期。
    - 在构造函数中获取资源
    - 在析构函数中释放资源

  对象存在 → 资源被持有；对象销毁 → 资源自动释放

## 拷贝构造函数——一种特殊的构造函数
例如

```cpp
class A {
public:
    A(const A& a);  // ← 拷贝构造函数
};
```
和一般的构造函数的区别是，多了一个参数。
深入理解一下const A& a，上课老师讲过，引用一旦绑定就不会改变，那是不是我可以通过这个引用改变a的具体内容(不改变引用仍然是a的引用)。const的绑定遵从就近原则：
| 声明                 | `const` 修饰谁？     | 能否改指针/引用？        | 能否改指向的内容？ |
|----------------------|----------------------|--------------------------|--------------------|
| `T* p`               | 无 `const`           | ✅ 能                    | ✅ 能              |
| `const T* p`         | `T`（内容）          | ✅ 能                    | ❌ 不能            |
| `T* const p`         | 指针本身             | ❌ 不能                  | ✅ 能              |
| `const T* const p`   | 两者都修饰           | ❌ 不能                  | ❌ 不能            |
| `const T& r`         | `T`（内容）          | ❌（引用不可变）         | ❌ 不能            |
### 拷贝构造函数的调用
简单的例子：
```cpp
A a;                // 调用默认构造函数 A()
A b = a;            // ✅ 调用拷贝构造函数 A(const A&)
A c(a);             // ✅ 调用拷贝构造函数 A(const A&)
```
函数调用：

```cpp
A f(A a) {          // 参数 a 是通过拷贝构造初始化的
    return a;
}

int main() {
    A obj;
    f(obj);         // 调用 f 时，obj → a：✅ 调用拷贝构造函数
}
```
调用了几次拷贝构造？
2次。一次传形参，一次是返回值（为什么返回值也需要一次拷贝构造，我明明没有接收返回值）
## 默认构造函数
如果你没有显式定义拷贝构造函数，编译器会为你生成一个默认拷贝构造函数。

- ✅ 它如何工作？
    - 成员逐个初始化（member-wise initialization）
    - 对于每个非静态成员：
        - 如果是基本类型（如 int, double），直接复制值
        - 如果是类类型，调用该类的拷贝构造函数（递归）

应该很好理解，就不举例了。

那何时需要自定义构造函数
- 浅拷贝问题
  ```cpp
  class string {
      char* p;
  public:
      string(char* str) {
          p = new char[strlen(str)+1];
          strcpy(p, str);
      }
      ~string() { delete[] p; }
  };
  
  string s1("abcd");
  string s2 = s1;
  ```
  s1和s2会指向同一块内存，如果s1被释放，s2就会变成悬挂指针。正确做法如下：
  ```cpp
  string::string(const string& s) {
      p = new char[strlen(s.p)+1];  // 分配新内存
      strcpy(p, s.p);               // 复制内容
  }
  ```
  如果是栈上数组？？不需要！！！
## 移动构造函数
为了解决函数调用的多次拷贝问题。转移一个对象的控制权
#### 左值、右值、左值引用、右值引用
- 左值：它可以出现在赋值表达式的左边。它代表一个有名字、有内存地址的对象。程序可以读取或修改它的内容。
- 右值：因为它通常出现在赋值表达式的右边。它是计算过程中产生的临时结果，没有持久的内存位置。没有对于这块内存的控制权。
  例如：

```cpp
     a = 1 + 2
     ↑     ↑
   l-value  r-value
```

```cpp
class A {};
int main() {
    A a = A();  // ← A() 是 r-value
}
```
- 左值引用(T&)和右值引用(T&&)是对左值或者右值的引用，和左值和右值的概念不同

在 C++ 中：
- 非常量引用（T&）只能绑定到左值（l-value）
- 常量引用（const T&）可以绑定到左值或右值
- 例如：

  ```cpp
  class A {};
  
  A getA() {
      return A();  // 返回一个临时对象（r-value）
  }
  
  int main() {
      int a = 1;
      int &ra = a;          // ✅ OK：非常量引用绑定左值
      const A &ca = getA(); // ✅ OK：常量引用绑定右值
      A &aa = getA();       // ❌ ERROR：非常量引用不能绑定右值
  }
  ```
- 右值引用专门用来绑定右值，并且**可以修改右值引用指向的内容**。（aa其实是左值）

  ```cpp
  A &&aa = getA();           // ✅ OK：右值引用绑定右值
  aa.setVal(2);              // ✅ OK：通过右值引用修改临时对象
  ```
#### 右值引用常当作移动构造函数的参数。


```cpp
	class MyArray {
	    int size;
	    int *arr;
	public:
	    MyArray(): size(0), arr(NULL) {}
	    MyArray(int sz): size(sz), arr(new int[sz]) {
	        // init array here...
	    }
	    
	    // 拷贝构造函数（深拷贝）
	    MyArray(const MyArray &other):
	        size(other.size),
	        arr(new int[other.size]) {
	        for (int i = 0; i < size; ++i)
	            arr[i] = other.arr[i];
	    }
	
	    // ✅ 移动构造函数（资源转移）
	    MyArray(MyArray &&other):
	        size(other.size),
	        arr(other.arr) {
	        other.arr = NULL;  // 关键！防止 double free
	    }
	
	    ~MyArray() {
	        delete[] arr;
	    }
	};
```

```cpp
	MyArray change_aw(const MyArray &other)
	{
	    MyArray aw(other.get_size());
	    //Do some change to aw.
	    //….
	    return aw;
	}
	
	int main() {
	    MyArray myArr(5);
		MyArray myArr2 = change_aw(myArr);
		//MyArray&& myArr2 = change_aw(myArr);这样不好，右值引用不要乱用
	}
```
在这个例子里面，change_aw(myArr)会返回一个临时对象，这个临时对象之后不会在用，因此直接将控制权交给myArr2即可，而不是像之前一样的拷贝构造函数，进行值拷贝。
#### 移动赋值

```cpp
class MyArray {
public:
    //…
    MyArray &operator=(const
        MyArray &other) {
        if (this == &other)
            return *this;
        if (arr) {			
        	delete[] arr;			
        	arr = NULL;
        }
        size = other.size;
        memcpy(arr, other.arr, size * 	sizeof(int));
        return *this;
    }
    MyArray &operator=(ArrayWrapper
        &&other) {
        size = other.size;
        arr = other.arr;
        other.arr = NULL;
        return *this;	
    }
}
```

```cpp

int main() {
    MyArray myArr;
    myArr = MyArray(5);
}
```
这里会调用移动构造函数吗？ 不会！只用MyArray myArr = ...会调用构造函数。
额外提一嘴：
```cpp
myArr.operator=(MyArray(5));  // 成员函数会被翻译成myArr = MyArray(5);
// 全局函数a @ b（其中 @ 是重载的运算符）会被编译器翻译成 operator@(a, b)

```
可以看到函数的返回值被丢弃了，所以你甚至可以链式赋值，a=b=c等等
#### 右值引用其实是左值？

```cpp
void process (int && r){}   
void handle (int && rvalue) {process (rvalue);} //错误的
```
右值引用其实是左值（注意区分右值引用和右值的区别）
所以应该要如下：

```cpp
void handle(int &&rvalue) {
    process(std::move(rvalue));  // ✅ 正确：显式转换为 rvalue
}
```
move()会把一个左值引用转化为右值引用，但是转化后，语义上不应该再访问右值。
## 动态内存
程序运行时可用两种内存：

- 栈（Stack）
    - 自动分配/释放（如局部变量）
    - 快、安全，但大小有限
- 堆（Heap）
    - 手动分配/释放，大小灵活
    - C 用 malloc/free，C++ 用 new/delete
    - 慢（多一次指针加载）、易出错（泄漏、悬空指针）

为什么要有new和delete？为了调用构造函数或者析构函数，free和malloc不会调用

在C++中自定义类型和内置类型都是同等看待，因此new一个int也是可以的。
```cpp
// 1. 创建 int 对象
int* p = new int;           // 默认值未初始化（垃圾值）
int* q = new int(10);       // 初始化为 10

// 2. 创建类对象
MyClass* obj = new MyClass();        // 调用默认构造函数
MyClass* obj2 = new MyClass(5);      // 调用带参构造函数
```
这里要注意一下，指针指向的对象在堆中，指针的值在栈上。
### delete的使用
delete与new成对出现
注意delete只能用于指针上！！！并且delete后加上置为空指针。
例如：
```cpp
delete custPtr;
custPtr = NULL;
```
#### 动态数组的删除
```cpp
A *p;
p = new A[100];//不能显式初始化，相应的类必须有默认构造函数
delete  []p;//注意要加上[]
```
如果只有delete p，仍然会释放p所占空间，但是不会对数组中每一个元素都使用析构函数。
另外不能显式初始化，相应的类必须有默认构造函数。
```cpp
p = new A[100](5);  // 不支持！
```
## const成员
### const成员变量
const成员变量初始化放在构造函数的成员初始化表中进行
```cpp
class A
{	   
const  int x;
public:
	 A(int c): x(c) {  } //一定要用成员初始化列表，不能在函数内赋值
}
```
如何理解一定要用成员初始化列表呢？const成员不能被赋值，成员初始化列表是视作初始化，而不是赋值。
### const成员函数
const 成员函数的语法：

```cpp
void show() const;
```
编译器会将其翻译成：

```cpp
void show(const A* const this);//还记得const的匹配吗？
```
但是注意成员函数加上const后只是不能改变对象的内容，const成员函数的参数是可以改变的。
看这个例子：

```cpp
class A
{
    int a;
    int & indirect_int;
public:
     A():indirect_int(*new int){ ... }
    ~A() { delete &indirect_int; }
    void f() const { indirect_int++; }//这个合法吗？合法！
};
```
这个f()是合法的，还记得之前说过引用是永远不会改变的，改变引用绑定对象的值，不改变引用本身。

#### mutable
有时你希望在 const 函数中也能修改某个成员变量（如缓存），这时可以用 mutable。
例如：

```cpp
struct Fib {
  ……
  Fib(int n) : n_(n) {}
  int value() const { 
    if (!cached) {
          cache  = fib(n);
      cached = true;
    }
    return cache;
  }
int n_;                            
mutable bool cached = false;
mutable int  cache  = 0;
}
```
### constant expressions
常量表达式是在 编译期就能求值 的表达式，能提升性能并增强类型安全。
常用于**数组初始化**，模板参数，**switch 的 case 标签**，**查表**/位运算等
- constexpr

  ```cpp
  constexpr int square(int x) { return x * x; }
  ```

  ```cpp
  constexpr int n = square(5);  // ✅ 编译期计算 → n = 25
  int a[n];                     // ✅ 合法！数组大小是常量表达式
  ```
  可在编译期求值（如果输入是常量）也可在运行期调用。
- consteval

  ```cpp
  consteval int factorial(int n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
  }
  ```
  必须在编译期求值
  如果调用点不是常量表达式 → 编译错误！
  只能用于函数声明上

  ```cpp
  constexpr int x = 5;
  constexpr int f1 = factorial(x);  // ✅ 编译期计算
  
  int y = 5;
  int f2 = factorial(y);            // ❌ 错误！y 是运行期值
  ```
#### 三个例子
1.
```cpp
int operator| (Flags f1, Flags f2)  { return Flags(int(f1)|int(f2)); }
//a @ b（其中 @ 是重载的运算符）会被编译器翻译成 operator@(a, b)
```

```cpp
void f(Flags x) {
    switch (x) {
        case BAD: /* ... */break;
        case EOF: /* ... */ break;
        case BAD|EOF: /* ... */ break; //报错|返回的不是常量，改为constexpr int operator|即可。
        default: /* ... */ break;
    }
}
```
2.

```cpp
struct Point {
    int x,y;
    constexpr Point(int xx, int yy) : x(xx), y(yy) { }
};
int main() {
    constexpr Point origo(0,0);
    constexpr int z = origo.x;

    constexpr Point a[] = {Point(0,0), Point(1,1), Point(2,2) };
    constexpr int x = a[1].x; // x becomes 1
}
```
这里的所有工作能在编译时就完成。
3. constexpr和consteval的区别
```cpp
constexpr int sqr(int x) { return x * x; }
constexpr int A = sqr(10);int y = 3; int B = sqr(y);//都正确

consteval int pow2(int n) { return 1 << n; }
constexpr int M = pow2(8);   // ✅
// int r = pow2(y); 错误
```
constexpr 函数（可选编译期），编译器求不出值也没关系。consteval一定要在编译期就能求出值！
## 静态成员
为了解决同一个类的不同对象（类是一个模板，对象是类的示例）如何共享数据”的问题，同时避免全局变量的造成的名污染和缺乏保护的缺点。
### 静态成员变量

```cpp
	class A
	{    int   x,y;
	     static int shared; //inline static int shared=0; (C++17) 
        .....
	};
	//定义不是赋值！！！
	int A::shared=0;//一定要在类外定义！！！不能放头文件！
	A a, b;
```
推荐在对应cpp中定义。
为什么需要这样？比较复杂。
include一个头文件，实际上就是将其内容拷贝到文件开头。一般的成员变量，即使在头文件中声明并定义了，也只有在类的某个对象被创建时才会为其分配内存，每个对象都有自己的内存，这没问题。
但是静态变量，在对象创建之前就会被分配内存（如果定义了的化，声明并不会为其分配内存）。如果多个文件中引入了这个头文件，就会导致一个变量被多次分配内存，多次定义的错误。
而inline的作用就是告诉编译器，那么多次分配内存其实是同一个变量。
### 静态成员函数
注意只能调用静态成员变量和静态成员函数。可以在头文件中定义（默认inline）
## 友元
让其他函数或者类能够访问这个类的private和protected成员
- 友元函数、友元类、友元成员函数

```cpp
#include <iostream>
// 前向声明（用于友元类和友元成员函数），让编译器知道类B和C的存在。
class B;
class C;
class A {
private:
    int x = 42;
    friend void func();
    friend class B;
    friend void C::f();
};
void func() {
    A a;
    std::cout << "友元函数访问 A::x = " << a.x << std::endl;  // ✅ 合法
}
class B {
public:
    void accessA(A& a) {
        std::cout << "友元类 B 访问 A::x = " << a.x << std::endl;  // ✅ 合法
        a.x = 100;  // 也可以修改
    }
};
class C {
public:
    void f();  // 成员函数声明
};
void C::f() {
    A a;
    std::cout << "友元成员函数 C::f() 访问 A::x = " << a.x << std::endl;  // ✅ 合法
}
```
注意友元不具有传递性！！
## 面向对象接口的设计原则
完满且最小化。

```cpp
class AccessLevels {
private:
    int noAccess;
    int readOnly;
    int readWrite;
    int writeOnly;

public:
    // 只读属性：只有 get
    int getReadOnly() const { return readOnly; }

    // 读写属性：get + set
    int getReadWrite() const { return readWrite; }
    void setReadWrite(int value) { readWrite = value; }

    // 只写属性：只有 set
    void setWriteOnly(int value) { writeOnly = value; }
};
```
不要全都设为私有变量，然后又全都能读又能写。