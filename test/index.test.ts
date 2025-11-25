import * as T from './testutil'
import { Path } from '../src/index'
import { homedir } from 'os'

const TEST = new Path(__dirname).join("data")

const USER_HOME_DIR = homedir()

test('trivial utilities', () => {
    const p = new Path('/foo/bar.txt')
    T.eq(p.absPath, "/foo/bar.txt")
    T.eq(p.toString(), "/foo/bar.txt")
    T.eq(p.valueOf(), "/foo/bar.txt")
    T.eq(p.toSimplified(), "/foo/bar.txt")
    T.eq(p.toJSON(), "/foo/bar.txt")
    T.eq(p.filename, "bar.txt")
    T.eq(p.extension, ".txt")
    T.eq(p.parent.absPath, "/foo")
    T.eq(p.parent.parent.absPath, "/")
    T.eq(p.parent.parent.parent.absPath, "/")
    T.eq(p.parent.parent.parent.parent.absPath, "/")
})

test('special paths', async () => {
    expect(Path.devNull.absPath).toEqual('/dev/null')
    expect(Path.userHomeDir.absPath).toEqual(USER_HOME_DIR)
    expect(await Path.userHomeDir.isDir()).toEqual(true)
    expect(await Path.systemTempDir.isDir()).toEqual(true)
})

test('CLI expand', () => {
    expect(Path.withCliExpansion('/foo').absPath).toEqual('/foo')
    expect(Path.withCliExpansion('/foo').localUrl).toEqual('file:///foo')
    expect(Path.withCliExpansion('~/foo').absPath).toEqual(`${USER_HOME_DIR}/foo`)
})

test('small text file', async () => {
    const p = TEST.join("hi.txt")
    T.be(await p.isFile(), true)
    T.be(await p.isDir(), false)
    T.be((await p.getInfo()).isDir, false)
    T.be((await p.getInfo()).isFile, true)
    T.be((await p.getInfo()).size, 5)
    T.be(await p.readAsString(), "hello")
    T.be(await p.readAsString("ascii"), "hello")
    T.be(await p.readAsString("base64"), "aGVsbG8=")
    T.be((await p.readAsBuffer()).toString("ascii"), "hello")
    T.be(await p.md5(), "5d41402abc4b2a76b9719d911017c592")
})

test('getting temp paths repeatedly yields different paths', () => {
    const paths = [Path.getTempPath(), Path.getTempPath(), Path.getTempPath(), Path.getTempPath(), Path.getTempPath(), Path.getTempPath()]
    for (let k = 0; k < paths.length; ++k) {
        for (let j = k + 1; j < paths.length; ++j) {
            T.is(paths[k].absPath != paths[j].absPath)
        }
    }
})

test('temp path does not exist, but its directory does', async () => {
    const p = Path.getTempPath()
    T.be(await p.isFile(), false)
    T.be(await p.isDir(), false)
    T.be(await p.parent.isDir(), true)
})