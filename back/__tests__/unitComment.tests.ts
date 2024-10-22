import { ICommentRepository } from '../src/pgRepository/CommentRepository'
import { CommentService } from '../src/services/CommentService'
import { Comment } from '../src/models/CommentModel';
import { mock, instance, when, anything } from 'ts-mockito';

describe('CommentService', () => {
    let commentService: CommentService;
    let commentRepository: ICommentRepository;

    beforeEach(() => {
        commentRepository = mock<ICommentRepository>();
        commentService = new CommentService(instance(commentRepository));
    });

    it('should create a comment', async () => {
        const productId = "test";
        const userId = "test";
        const text = "anytext";

        const commentCreated = new Comment(
            "test", 
            userId, 
            productId,
            text,
            0,
        )
        when(commentRepository.create(anything())).thenResolve(commentCreated);
    
        commentService.create({            
            userid: userId,
            productId: productId,
            text: text
        }).then((result) => {
            expect(result).toEqual({
                id: "test", 
                userId: userId, 
                productId: productId,
                text: text,
                rate: 0
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findByProductId: success', async () => {
        const productId = "test";
        const userId = "test";
        const text = "anytext";

        const commentsToFind = [
            new Comment(
            "test1", 
            userId, 
            productId,
            text,
            0,
        ),
        new Comment(
            "test2", 
            userId, 
            productId,
            text,
            0,
        )
        ]

        when(commentRepository.getByProductId("test")).thenResolve(commentsToFind);
    
        commentService.findByProductId("test")
        .then((result) => {
            expect(result).toEqual([{
                id: "test1", 
                userId: userId, 
                productId: productId,
                text: text,
                rate: 0
            },
            {
                id: "test2", 
                userId: userId, 
                productId: productId,
                text: text,
                rate: 0
            }]);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findByProductId: fail', async () => {

        when(commentRepository.getByProductId("badid")).thenResolve([]);
    
        commentService.findByProductId("badid")
        .then((result) => {
            if (result instanceof Error) {
                throw result
            }
        }).catch((error: Error) => {
            expect(error.message).toEqual("comments not found by this product id");
        });
    });

    it('update rate', async () => {
        const productId = "test";
        const userId = "test";
        const text = "anytext";

        const commentToFind = new Comment(
            "test", 
            userId, 
            productId,
            text,
            0,
        )
        const commentUpdated = new Comment(
            "test", 
            userId, 
            productId,
            text,
            5,
        )

        when(commentRepository.getById("test")).thenResolve(commentToFind);
        when(commentRepository.update(anything())).thenResolve(commentUpdated);
    
        commentService.updateRate({     
            id: "test",
            rate: 5,
        }).then((result) => {
            expect(result).toEqual({
                id: "test", 
                userId: userId, 
                productId: productId,
                text: text,
                rate: 5
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('update rate failed', async () => {
        when(commentRepository.getById("badid")).thenResolve(null);
        commentService.updateRate({     
            id: "badid",
            rate: 5,
        }).then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("comment to update not found");
        });
    });
    it('delete comment', async () => {
        when(commentRepository.delete("test")).thenResolve(true);
        commentService.delete("test")
        .then((result) => {
            expect(result).toEqual(true);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('delete comment fail', async () => {
        when(commentRepository.delete("badid")).thenResolve(false);
        commentService.delete("badid")
        .then((result) => {
            expect(result).toEqual(false);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
});
