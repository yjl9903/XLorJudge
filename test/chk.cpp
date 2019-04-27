#include <testlib.h>
#include <cstdio>

int main (int argc, char* argv[]) {
  for (int i = 0; i < argc; i++) puts(argv[i]);
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