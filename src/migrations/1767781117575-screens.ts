import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Screens1767781117575 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'screens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '5',
          },
          {
            name: 'seats',
            type: 'int',
          },
          {
            name: 'theatre_id',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
            default: null,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'screens',
      new TableForeignKey({
        columnNames: ['theatre_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'theatres',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('screens');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('theatre_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('screens', foreignKey);
      }
    }
    await queryRunner.dropTable('screens');
  }
}
