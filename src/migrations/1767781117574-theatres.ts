import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Theatres1767781117574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'theatres',
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
            length: '30',
          },
          {
            name: 'address',
            type: 'text',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'city_id',
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

    await queryRunner.createForeignKeys('theatres', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['city_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cities',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('theatres');
    if (table) {
      const userFk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      const cityFk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('city_id') !== -1,
      );

      if (userFk) await queryRunner.dropForeignKey('theatres', userFk);
      if (cityFk) await queryRunner.dropForeignKey('theatres', cityFk);
    }
    await queryRunner.dropTable('theatres');
  }
}
