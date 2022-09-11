import express from 'express'

const app = express()
const port = 3000

const jsonBodyMiddelware = express.json();
app.use(jsonBodyMiddelware);

const HTTP_STATUSES = {
  OK200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
}

const db = {
  courses: [
    {id: 1, title: 'front'},
    {id: 2, title: 'back'}, 
    {id: 3, title: 'full'},
    {id: 4, title: 'devops'},
  ],
}

app.get('/courses', (req, res) => {
  let foundCourses = db.courses
  if(req.query.title) {
    foundCourses = foundCourses.filter(e => e.title.indexOf(req.query.title as string) > -1)
  }
  res.json(foundCourses)
})

app.get('/courses/:id', (req, res) => {
  const foundCourses = db.courses.find(e => e.id === Number(req.params.id))

  if(!foundCourses) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({message: 'Not found'})
    return
  }
  res.json(foundCourses)
})

app.post('/courses', (req, res) => {
  if(!req.body.title) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({message: 'No title'})
    return
  }

  const newCourse = {
    id: Number(new Date()),
    title: req.body.title
  }
  db.courses.push(newCourse)
  res.status(HTTP_STATUSES.CREATED_201).json(newCourse)
})

app.delete('/courses/:id', (req, res) => {
  db.courses = db.courses.filter(e => e.id !== Number(req.params.id))

  res.status(HTTP_STATUSES.CREATED_201).json({message: 'Deleted'})
})

app.put('/courses/:id', (req, res) => {
  if(!req.body.title) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({message: 'No title'})
    return
  }

  const foundCourses = db.courses.find(e => e.id === Number(req.params.id))

  if(!foundCourses) {
    res.status(HTTP_STATUSES.NO_CONTENT_204).json({message: 'Not found'})
    return
  }

  foundCourses.title = req.body.title;
  
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
  console.log(`Example app listening on port \nhttp://localhost:${port}`)
})