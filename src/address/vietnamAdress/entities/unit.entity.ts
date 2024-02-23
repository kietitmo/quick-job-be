import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('administrative_units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  full_name_en: string;

  @Column({ type: 'varchar', length: 255 })
  short_name: string;

  @Column({ type: 'varchar', length: 255 })
  short_name_en: string;

  @Column({ type: 'varchar', length: 255 })
  code_name: string;

  @Column({ type: 'varchar', length: 255 })
  code_name_en: string;
}
