#include <iostream>
using namespace std;
const int mod = 1e9 + 7;

int dfs(int u, int v) {
  if (u == 0) return v;
  return (dfs(u - 1, v) + 1) % mod;
}

int main () {
  int a = 1, b = 1;
  cin >> a >> b;
  cout << dfs(min(a, b), max(a, b));
  return 0;
}