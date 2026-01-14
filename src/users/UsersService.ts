import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
    private users: User[] = [];
    private idCounter = 1;
    create(userData: Omit<User, 'id' | 'createdAt'>): User {
        const newUser: User = {
            id: this.idCounter++,
            ...userData,
            createdAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }

    findAll() {
        return this.users;
    }

    findByEmail(email: string): User {
        const user = this.users.find(user => user.email === email);
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }
        return user;


    }
    findById(id: number): User {
        const user = this.users.find((user) => user.id === id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }

}
