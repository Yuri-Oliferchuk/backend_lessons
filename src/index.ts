import express, { Request, Response } from 'express'
import { CourseCreateModel } from './models/CourseCreateModel';
import { CourseUpdateModel } from './models/CourseUpdateModel';
import { CourseURIModel } from './models/CourseURIModel';
import { CoursesViewModel } from './models/CourseViewModel';
import { CoursesQueryModel } from './models/GetCoursesQueryModel';
import { RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery } from './types';

export const app = express()
const port = 3000

const jsonBodyMiddelware = express.json();
app.use(jsonBodyMiddelware);

export const HTTP_STATUSES = {
  OK200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
}

type CoursesType = {
  id: number,
  title: string
}

const db: {courses: CoursesType[]} = {
  courses: [
    {id: 1, title: 'front'},
    {id: 2, title: 'back'}, 
    {id: 3, title: 'full'},
    {id: 4, title: 'devops'},
  ],
}

const getViewModel = (dbCourse: CoursesType): CoursesViewModel => {
  return {
    id: dbCourse.id,
    title: dbCourse.title
  }
}

app.get('/courses', (req: RequestWithQuery<CoursesQueryModel>, 
                     res: Response<CoursesViewModel[]>) => {
  let foundCourses = db.courses
  if(req.query.title) {
    foundCourses = foundCourses.filter(e => e.title.indexOf(req.query.title as string) > -1)
  }

  res.json(foundCourses.map(getViewModel))
})

app.get('/courses/:id', (req: RequestWithParams<CourseURIModel>, 
                         res: Response<CoursesViewModel | undefined>) => {
  const foundCourse = db.courses.find(e => e.id === Number(req.params.id))

  if(!foundCourse) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    return
  }
  res.json(getViewModel(foundCourse))
})

app.post('/courses', (req: RequestWithBody<CourseCreateModel>, 
                      res: Response<CoursesViewModel>) => {
  if(!req.body.title) {
    res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
    return
  }

  const newCourse = {
    id: Number(new Date()),
    title: req.body.title
  }
  db.courses.push(newCourse)
  
  res.status(HTTP_STATUSES.CREATED_201).json(newCourse)
})

app.delete('/courses/:id', (req: RequestWithParams<CourseURIModel>, 
                            res: Response<{message: string}>) => {
  db.courses = db.courses.filter(e => e.id !== Number(req.params.id))

  res.status(HTTP_STATUSES.NO_CONTENT_204).json({message: 'Deleted'})
})

app.put('/courses/:id', (req: RequestWithParamsAndBody<CourseURIModel, CourseUpdateModel>, 
                         res: Response<{message: string} | CoursesViewModel>) => {
  if(!req.body.title) {
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({message: 'No title'})
    return
  }

  const foundCourses = db.courses.find(e => e.id === Number(req.params.id))

  if(!foundCourses) {
    res.status(HTTP_STATUSES.NOT_FOUND_404).json({message: 'Not found'})
    return
  }

  foundCourses.title = req.body.title;
  
  res.status(HTTP_STATUSES.CREATED_201).json(getViewModel(foundCourses))
})

app.delete('/__test__/data', (req: Request, res: Response) => {
  db.courses = [],
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
  console.log(`Example app listening on port \nhttp://localhost:${port}`)
})