import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// import { Unit } from './unit.entity';
import { Province } from './province.entity';

@Entity('districts')
export class District {
  @PrimaryColumn({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  name_en: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  full_name_en: string;

  @Column({ type: 'varchar', length: 255 })
  code_name: string;

  @ManyToOne(() => Province)
  @Column({ type: 'varchar', length: 20 })
  @JoinColumn({ name: 'province_code' })
  province_code: string;

  // @ManyToOne(() => Unit)
  // @Column()
  // @JoinColumn({ name: 'administrative_unit_id' })
  // administrative_unit_id: number;
}
