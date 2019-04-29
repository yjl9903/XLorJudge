#include <iostream>
using namespace std;
const int mod = 998244353;
const int maxn = 100000000 + 5;

int n, a[maxn];

int main() {
  cin >> n >> a[1];
  for (int i = 2; i < maxn; i++) a[i] = a[i - 1] * 2 % mod;
  cout << a[maxn - 1];
  return 0;
}