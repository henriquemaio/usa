import monk from 'monk';

export default monk(process.env.MONGO_URL || 'localhost:27017/sentimental');
