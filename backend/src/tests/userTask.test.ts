import { userTaskService } from '../services/userTask.service';

describe('User Task Selection Unit Tests', () => {
    it('should throw BadRequestError when taskIds is not an array', async () => {
        await expect(
            userTaskService.saveUserSelectedTasks('user-uuid-123', 'invalid-string' as any)
        ).rejects.toThrow('taskIds must be an array of UUIDs');
    });
});
