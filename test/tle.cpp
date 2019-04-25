#include <iostream>
#include <vector>
#include <random>
#include <ctime>
using namespace std;
const int maxn = 1e8;

mt19937 rnd(time(0));

int main () {
  int a = 0, b = 0;
  // cin >> a >> b;
  vector<int> v;
  for (int i = 0; i < maxn; i++) {
    int x = a; if (rnd() % 2) x = b;
    a = (2ll * x + 1ll * rnd()) % maxn;
  }
  cout << a << endl;
  return 0;
}