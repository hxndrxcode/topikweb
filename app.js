const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const DB = require('memory-cache')
const helper = require('./helper')

helper.initDocs()
helper.initBlog()

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(expressLayouts)

// Global Variable

const config = require('./config.json')
const { site_name, tagline } = config
for (let key of Object.keys(config)) {
    global[key] = config[key]
}
global.navLink = ''
global.csrfToken = ''
global.cdnUrl = ''
global.flashError = ''
global.sidebar = ''
global.script = ''

// Routing

app.get('/', (req, res) => {
    return res.render('index', {
        title: site_name + ' - ' + tagline,
        navLink: 'home'
    })
})

app.get('/blog', (req, res) => {
    let data = DB.get('blogindex')
    return res.render('blog', {
        title: 'Blog - ' + site_name,
        navLink: 'blog',
        data
    })
})

app.get('/blog/:id', (req, res) => {
    let posts = DB.get('blogindex')
    let idx = posts.findIndex(v => v.id == req.params.id)
    if (idx === -1) {
        return res.sendStatus(404)
    }

    let post = posts[idx]
    post.body = helper.file2html('./blog/' + post.yeardir + '/' + idx + '.' + post.id + '.md')
    return res.render('blog-detail', {
        title: post.title + ' - ' + site_name,
        post
    })
})

app.get('/docs', (req, res) => {
    let data = DB.get('docsindex')
    return res.render('docs', {
        title: 'Documentations - ' + site_name,
        navLink: 'docs',
        data
    })
})

app.get('/docs/:topic/:post?', (req, res) => {
    let file = req.params.post || 'index'
    let post = (DB.get('docspost')).find(v => v.topic == req.params.topic && v.id == file)
    if (!post) {
        return res.sendStatus(404)
    }

    let sidebar = DB.get('docsmenu_' + post.topic)
    post.body = helper.file2html(post.file_path)
    let topic = (DB.get('docsindex')).find(v => v.id == post.topic)

    return res.render('docs-detail', {
        title: post.title + ' - ' + topic.title + ' - ' + site_name,
        topic,
        post,
        sidebar
    })
})

// Start Server

app.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
})