#include <testlib.h>

int main (int argc, char* argv[]) {
  registerTestlibCmd(argc, argv);
  char ch;
  while (ch = ans.readChar()) {
    if (ch == -1) break;
    if (ouf.readChar() != ch) {
      quitf(_wa, "wrong answer");
    }
  }
  quitf(_ok, "accepted");
}