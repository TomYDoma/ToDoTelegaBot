import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll(chatID: string) {
    const date = new Date();
    const operationLabel = 1;
    const user = await this.userRepository.create({
      chatID,
      date,
      operationLabel,
    });
    await this.userRepository.save(user);
    return this.taskRepository.findBy({ chatID });
  }

  async getById(id: number) {
    return this.taskRepository.findOneBy({ id });
  }

  async getByName(name: string, chatID: string) {
    return this.taskRepository.findOneBy({ name, chatID });
  }

  async createTask(name: string, chatID: string) {
    const date = new Date();
    const operationLabel = 2;
    const user = await this.userRepository.create({
      chatID,
      date,
      operationLabel,
    });
    await this.userRepository.save(user);
    const task = await this.taskRepository.create({ name, chatID });

    await this.taskRepository.save(task);
    return this.getAll(chatID);
  }

  async doneTask(id, chatID: string) {
    const date = new Date();
    const operationLabel = 3;
    const user = await this.userRepository.create({
      chatID,
      date,
      operationLabel,
    });
    await this.userRepository.save(user);

    const task = await this.getById(id);
    if (!task) return null;

    task.isCompleted = !task.isCompleted;
    await this.taskRepository.save(task);
    return this.getAll(chatID);
  }

  async editTask(id: number, name: string, chatID: string) {
    const date = new Date();
    const operationLabel = 4;
    const user = await this.userRepository.create({
      chatID,
      date,
      operationLabel,
    });
    await this.userRepository.save(user);

    const task = await this.getById(id);
    if (!task) return null;

    task.name = name;
    await this.taskRepository.save(task);

    return this.getAll(chatID);
  }

  async deleteTask(id: number, chatID: string) {
    const date = new Date();
    const operationLabel = 5;
    const user = await this.userRepository.create({
      chatID,
      date,
      operationLabel,
    });
    await this.userRepository.save(user);
    const task = await this.getById(id);
    if (!task) return null;

    await this.taskRepository.delete({ id });
    return this.getAll(chatID);
  }
}
