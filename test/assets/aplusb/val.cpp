#include "testlib.h"

using namespace std;

int main(int argc, char* argv[]) {
  registerValidation(argc, argv);
  inf.readInt(0, 1000000000, "a");
  inf.readSpace();
  inf.readInt(0, 1000000000, "b");
  inf.readEoln();
  inf.readEof();
}
