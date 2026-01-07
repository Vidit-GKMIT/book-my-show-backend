import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class TheatreAttributes1767808761757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'theatre_attributes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '30',
          },
          {
            name: 'value',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('theatre_attributes');
  }
}
