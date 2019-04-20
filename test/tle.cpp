#include <iostream>
#include <vector>
#include <random>
#include <ctime>
using namespace std;
const int maxn = 1e9;

mt19937 rnd(time(0));

int main () {
  int a = 0;
  vector<int> v;
  for (int i = 0; i < maxn; i++) {
    a = (2ll * a + 1ll * rnd()) % maxn;
  }
  cout << a << endl;
  return 0;
}