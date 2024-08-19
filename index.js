const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()

app.use(cors())
app.use(express.json())

const db = 'db.json'

const getLinks = () => {
    const dbObject = JSON.parse(fs.readFileSync(db).toString())
    return dbObject.links
}

const getLink = linkIn => links.find(l => l.linkIn === linkIn)

const setLinks = ls => {
    links = ls
    const dbObject = { links }
    fs.writeFileSync(db, JSON.stringify(dbObject))
}

const generateCustomLink = () => {
    const LINK_LENGTH = 4
    const availableChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const randomChar = () => availableChars[Math.floor(Math.random() * availableChars.length)]
    while (true) {
        const customLink = Array(LINK_LENGTH).fill().map(randomChar).join('')
        if (links.includes(l => l.linkIn === customLink))
            continue
        return customLink
    }
}

const linkExists = link => links.some(l => l.linkIn === link.linkIn)

let links = getLinks()


app.post('/api/links', (request,response) => {
    const link = {...request.body}
    if (!link.linkOut)
        return response.status(400).json({error: 'URL is missing.'})
    if (!link.linkIn)
        link.linkIn = generateCustomLink()
    else if (linkExists(link))
        return response.status(409).json({error: 'Custom link is already in use.'})
    if (!link.linkIn.match(/^[a-z0-9]+$/i))
        return response.status(400).json({error: 'Custom link format is invalid.'})
    link.linkIn = link.linkIn.toLowerCase()
    link.id = link.linkIn
    setLinks(links.concat(link))
    response.json(link)
})

app.get('/:linkIn', (request, response) => {
    const linkIn = request.params.linkIn
    const link = getLink(linkIn)
    if (link)
        response.redirect(link.linkOut)
    else
        response.status(404).json({error: 'link not found'})
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})