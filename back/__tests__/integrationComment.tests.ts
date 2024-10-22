import { PostgresCommentRepository } from '../src/pgRepository/CommentRepository'
import { Comment } from '../src/models/CommentModel'
import { CommentService } from '../src/services/CommentService'
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' }); // Используем конфигурацию для тестов

describe('Comment Integration Tests', () => {
    let repository: PostgresCommentRepository;
    let service: CommentService;
    repository = new PostgresCommentRepository();
    service = new CommentService(repository);

    test('createComment - создание комментария', async () => {
        await repository.initialize()
        const newComment = new Comment('', '2', '1', 'Отличный товар!', 0);
        await service.create({userid: "2", productId: "1", text: "Отличный товар!"})
        .then((createdComment) => {
            if (createdComment instanceof Error){
                throw(createdComment);
                }
                expect(createdComment).toBeDefined();
                expect(createdComment.id).toBeDefined();
                expect(createdComment.text).toBe(newComment.text);
                expect(createdComment.rate).toBe(newComment.rate);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('getCommentsByProductId - получение комментариев по ID продукта', async () => {
        const productId = '1';
        await service.findByProductId(productId )
        .then((comments) => {
            if (comments instanceof Error){
                throw(comments);
                }
                expect(comments).toHaveLength(1); // Предполагается, что только что созданный комментарий существует
                expect(comments[0].productId).toBe(productId);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('updateComment - обновление комментария', async () => {
        const productId = '1';
        let commentId = "0"; 
        await service.findByProductId(productId )
        .then((comments) => {
            if (comments instanceof Error){
                throw(comments);
                }
                commentId = comments[0].id;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })

        const updatedRate = 4;
        await service.updateRate({id: commentId, rate: updatedRate} )
        .then((updated) => {
            if (updated instanceof Error){
                throw(updated);
                }
                expect(updated).toBeDefined();
                expect(updated?.id).toBe(commentId);
                expect(updated?.rate).toBe(updatedRate);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('deleteComment - удаление комментария', async () => {
        const productId = '1';
        let commentId = "0"; 
        await service.findByProductId(productId)
        .then((comments) => {
            if (comments instanceof Error){
                throw(comments);
                }
                commentId = comments[0].id;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })

        const deleted = await service.delete(commentId);
        expect(deleted).toBeTruthy();
    });
});
