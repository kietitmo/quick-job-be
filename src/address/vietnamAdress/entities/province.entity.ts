import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// import { Unit } from './unit.entity';
// import { Region } from './region.entity';

@Entity('provinces')
export class Province {
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

  // @ManyToOne(() => Unit)
  // @Column()
  // @JoinColumn({ name: 'administrative_unit_id' })
  // administrative_unit_id: number;

  // @ManyToOne(() => Region)
  // @Column()
  // @JoinColumn({ name: 'administrative_region_id' })
  // administrative_region_id: number;
}
