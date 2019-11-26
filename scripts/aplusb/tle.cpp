#include <iostream>
using namespace std;

int main () {
  int a = 1, b = 1;
  cin >> a >> b;
  for (int i = 1; i <= (int)1e9; i++) {
    a += b; a %= 998244353;
  }
  cout << a + b;
  return 0;
}