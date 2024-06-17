import { Column, Entity, PrimaryColumn, Repository } from 'typeorm';

export type VehicleValuationDto = {
  vrm: string;
  lowestValue: number;
  highestValue: number;
  providerName?: string;
};

@Entity()
export class VehicleValuation {
  static from(valuation: VehicleValuationDto): VehicleValuation {
    const vehicleValuation = new VehicleValuation();
    vehicleValuation.vrm = valuation.vrm;
    vehicleValuation.lowestValue = valuation.lowestValue;
    vehicleValuation.highestValue = valuation.highestValue;
    vehicleValuation.providerName = valuation.providerName;
    return vehicleValuation;
  }

  @PrimaryColumn({ length: 7 })
  vrm: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lowestValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  highestValue: number;

  @Column({ type: 'text', nullable: true })
  providerName?: string;

  get midpointValue(): number {
    return (this.highestValue + this.lowestValue) / 2;
  }
}

export const getVehicleValuationByVrm = async (vrm: string, repository: Repository<VehicleValuation>) =>
  repository.findOneBy({ vrm });
