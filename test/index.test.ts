import * as T from './testutil'
import { Path } from '../src/index'

const TEST = new Path(__dirname).join("data")

test('listToMapOfLists', () => {
    expect(Path.devNull.absPath).toEqual('/dev/null')
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
})