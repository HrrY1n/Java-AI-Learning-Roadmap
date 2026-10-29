"""Check the Bash runner's 30-second timeout in an isolated path with spaces."""
import csv
import io
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import time


def process_exists(pid):
    if os.name == "nt":
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV", "/NH"],
            capture_output=True, text=True, check=True,
        )
        return any(len(row) > 1 and row[1] == str(pid)
                   for row in csv.reader(io.StringIO(result.stdout)))
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    return True


def verify_timeout(script):
    if os.name == "nt":
        git = shutil.which("git")
        assert git, "Install Git for Windows first"
        bash = Path(git).resolve().parents[1] / "bin/bash.exe"
    else:
        bash = shutil.which("bash")
    assert bash and Path(bash).is_file(), "Git Bash (Windows) or bash is required"
    with tempfile.TemporaryDirectory(prefix="java verify ") as directory:
        root = Path(directory)
        (root / "scripts").mkdir()
        (root / "scripts/verify_java.sh").write_bytes(script)
        source = root / "lesson with spaces/probe/DelayProbe.java"
        source.parent.mkdir(parents=True)
        source.write_text(
            'package probe;\n'
            'import java.nio.file.*;\n'
            'public class DelayProbe {\n'
            '  public static void main(String[] args) throws Exception {\n'
            '    Files.writeString(Path.of("pid.txt"), "" + ProcessHandle.current().pid());\n'
            '    Thread.sleep(Long.parseLong(Files.readString(Path.of("delay.txt"))));\n'
            '    System.out.println("PROBE_DONE");\n'
            '  }\n'
            '}\n', encoding="utf-8",
        )
        (root / "scripts/verify_manifest.tsv").write_bytes(
            b"lesson with spaces\tprobe.DelayProbe\t-\tout\tPROBE_DONE\r\n"
        )
        for delay, expected_exit in ((4000, 0), (60000, 1)):
            lesson = source.parents[1]
            pid_path = lesson / "pid.txt"
            pid_path.unlink(missing_ok=True)
            (lesson / "delay.txt").write_text(str(delay), encoding="ascii")
            started = time.monotonic()
            try:
                result = subprocess.run(
                    [str(bash), "scripts/verify_java.sh"], cwd=root,
                    capture_output=True, text=True, encoding="utf-8",
                    errors="replace", timeout=90,
                )
                elapsed = time.monotonic() - started
                assert result.returncode == expected_exit, (
                    f"delay={delay}ms elapsed={elapsed:.1f}s\n" + result.stdout + result.stderr
                )
                assert pid_path.exists(), "Probe did not start"
                assert not process_exists(int(pid_path.read_text())), "Orphaned JVM"
                assert not (lesson / "out").exists(), "Compile output not cleaned"
                if delay == 60000:
                    assert "30s" in result.stdout and 29 <= elapsed < 45, (
                        f"Timeout elapsed={elapsed:.1f}s\n" + result.stdout
                    )
                print(f"PASS delay={delay}ms exit={result.returncode} elapsed={elapsed:.1f}s")
            finally:
                # A failing runner must not leave the deliberately sleeping probe alive.
                if pid_path.exists():
                    pid = int(pid_path.read_text())
                    if process_exists(pid):
                        if os.name == "nt":
                            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"],
                                           capture_output=True, check=True)
                        else:
                            os.kill(pid, signal.SIGKILL)


if __name__ == "__main__":
    verify_timeout(Path(__file__).with_name("verify_java.sh").read_bytes())
