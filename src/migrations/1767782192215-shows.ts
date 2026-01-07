import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Shows1767782192215 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shows',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'price',
            type: 'int',
          },
          {
            name: 'show_date_time',
            type: 'timestamptz',
          },
          {
            name: 'show_end_date_time',
            type: 'timestamptz',
          },
          {
            name: 'available_seats',
            type: 'int',
          },
          {
            name: 'movie_id',
            type: 'int',
          },
          {
            name: 'screen_id',
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

    // Add foreign key constraint for Movie
    await queryRunner.createForeignKey(
      'shows',
      new TableForeignKey({
        columnNames: ['movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'shows',
      new TableForeignKey({
        columnNames: ['screen_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'screens',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('shows');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('movie_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('shows', foreignKey);
      }
    }
    await queryRunner.dropTable('shows');
  }
}
