import request from 'supertest';
import { app, HTTP_STATUSES } from '../../src';
import { CourseCreateModel } from '../../src/models/CourseCreateModel';
import { CourseUpdateModel } from '../../src/models/CourseUpdateModel';

describe('/course', () => {
    beforeAll( async () => {
        await request(app).delete('/__test__/data')
    })

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK200, [])
    })

    it('should return 404 for not existing course', async () => {
        await request(app)
            .get('/courses/99999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it(`shouldn't create course with incorrect input data`, async () => {

        const data: CourseCreateModel = { title: '' };

        await request(app)
            .post('/courses')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK200, [])
    })

    let createdCourse: any = null;
    it(`should create course with correct input data`, async () => {

        const data: CourseCreateModel = { title: 'Hello' };

        const responce = await request(app)
            .post('/courses')
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)
        
        createdCourse = responce.body
        expect(createdCourse).toEqual({
            id: expect.any(Number),
            title: data.title
        })

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK200, [createdCourse])
    })
    
    let createdCourse2: any = null;
    it(`should create one more course`, async () => {

        const data: CourseCreateModel = { title: 'Hello1' };

        const responce = await request(app)
            .post('/courses')
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)
        
        createdCourse2 = responce.body
        expect(createdCourse2).toEqual({
            id: expect.any(Number),
            title: data.title
        })

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK200, [createdCourse, createdCourse2])
    })

    it(`shouldn't update course with incorrect input data`, async () => {

        const data: CourseUpdateModel = { title: '' };
        
        await request(app)
            .put(`/courses/${createdCourse.id}`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
            
        await request(app)
        .get(`/courses/${createdCourse.id}`)
        .expect(HTTP_STATUSES.OK200, createdCourse)
        
    })

    it(`shouldn't update course that not exist`, async () => {

        const data: CourseUpdateModel = { title: 'Hello' };
        
        await request(app)
            .put(`/courses/-100`)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
                    
    })

    it(`should update course with correct input data`, async () => {

        const data: CourseUpdateModel = { title: 'Hello new title' };
        
        await request(app)
            .put(`/courses/${createdCourse.id}`)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        await request(app)
            .get(`/courses/${createdCourse.id}`)
            .expect(HTTP_STATUSES.OK200, {
                ...createdCourse,
                title: data.title
            })

        await request(app)
            .get(`/courses/${createdCourse2.id}`)
            .expect(HTTP_STATUSES.OK200, createdCourse2)
    })

    it(`should delete both courses`, async () => {
        await request(app)
            .delete(`/courses/${createdCourse.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/courses/${createdCourse.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete(`/courses/${createdCourse2.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
            
        await request(app)
            .get(`/courses/${createdCourse2.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
        
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK200, [])
    })

})