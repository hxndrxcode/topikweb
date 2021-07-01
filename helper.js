const fs = require('fs')
const DB = require('memory-cache')
const md = require('markdown-it')()

class Helper {
    initDocs() {
        let docsIndex = JSON.parse(fs.readFileSync('./docs/index.json'))
        DB.put('docsindex', docsIndex)

        let docsPost = []
        for (let d of docsIndex) {
            let dir = d.id        
            let root = './docs/' + dir
            let group = JSON.parse(fs.readFileSync(root + '/group.json'))
            for (let f of fs.readdirSync(root)) {
                if (f == 'group.json') {
                    continue
                }
                let split = f.split('.')
                let i = split[0]
                let seq = split[1]
                let link = split[2] == 'index' ? '' : '/' + split[2]
                let title = group[i].posts[seq]
        
                group[i].posts[seq] = {
                    id: split[2],
                    topic: dir,
                    link: '/docs/' + dir + link,
                    title,
                    file_path: root + '/' + f
                }
                docsPost.push(group[i].posts[seq])
            }

            DB.put('docsmenu_' + dir, group)
        }
        DB.put('docspost', docsPost)
    }

    initBlog() {
        let index = JSON.parse(fs.readFileSync('./blog/index.json'))
        DB.put('blogindex', index)
    }

    file2html(path) {
        let str = fs.readFileSync(path, 'utf-8')
        return md.render(str)
    }
}

module.exports = new Helper()
