import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// import { Unit } from './unit.entity';
import { District } from './district.entity';

@Entity('wards')
export class Ward {
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

  @ManyToOne(() => District)
  @Column({ type: 'varchar', length: 20 })
  @JoinColumn({ name: 'district_code' })
  district_code: string;

  // @ManyToOne(() => Unit)
  // @Column()
  // @JoinColumn({ name: 'administrative_unit_id' })
  // administrative_unit_id: string;
}
