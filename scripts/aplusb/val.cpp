#include "testlib.h"

using namespace std;

int main(int argc, char* argv[]) {
  registerValidation(argc, argv);
  inf.readInt(0, 100000, "a");
  inf.readSpace();
  inf.readInt(0, 100000, "a");
  inf.readEoln();
  inf.readEof();
}