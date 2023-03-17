import { jest } from '@jest/globals';
import voucherService from 'services/voucherService';
import voucherRepository from 'repositories/voucherRepository';
import * as errors from 'utils/errorUtils';
import { faker } from '@faker-js/faker';

describe('voucher service unit tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a voucher', async () => {
        const code = faker.random.alphaNumeric(5);
        const discount = faker.datatype.number({
            min: 1,
            max: 100,
        });

        jest.spyOn(
            voucherRepository,
            'getVoucherByCode'
        ).mockImplementationOnce(() => undefined);

        jest.spyOn(voucherRepository, 'createVoucher').mockImplementationOnce(
            (): any => {}
        );

        await voucherService.createVoucher(code, discount);

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.createVoucher).toHaveBeenCalled();
    });

    it('should throw "Voucher already exist."', async () => {
        const code = faker.random.alphaNumeric(5);
        const discount = faker.datatype.number({
            min: 1,
            max: 100,
        });
        const message = 'Voucher already exist.';

        jest.spyOn(
            voucherRepository,
            'getVoucherByCode'
        ).mockImplementationOnce((): any => true);

        jest.spyOn(errors, 'conflictError').mockImplementationOnce(
            (): any => new Error(message)
        );

        await expect(
            voucherService.createVoucher(code, discount)
        ).rejects.toThrowError(message);
        expect(errors.conflictError).toHaveBeenCalled();
        expect(voucherRepository.createVoucher).not.toHaveBeenCalled();
    });

    it('should succefuly apply voucher', async () => {
        const code = faker.random.alphaNumeric(5);
        const amount = faker.datatype.number({
            min: 100,
        });
        const discount = faker.datatype.number({
            min: 1,
            max: 100,
        });
        const used = false;

        jest.spyOn(
            voucherRepository,
            'getVoucherByCode'
        ).mockImplementationOnce((): any => {
            return { used, discount };
        });

        jest.spyOn(voucherRepository, 'useVoucher').mockImplementationOnce(
            (): any => true
        );

        const received = await voucherService.applyVoucher(code, amount);

        expect(received).toHaveProperty('applied');
        expect(received.applied).toBe(true);
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.useVoucher).toHaveBeenCalled();
    });

    it('should throw "Voucher does not exist."', async () => {
        const code = faker.random.alphaNumeric(5);
        const amount = faker.datatype.number();
        const message = 'Voucher does not exist.';

        jest.spyOn(
            voucherRepository,
            'getVoucherByCode'
        ).mockImplementationOnce(() => undefined);

        jest.spyOn(errors, 'conflictError').mockImplementationOnce(
            (): any => new Error(message)
        );

        await expect(
            voucherService.applyVoucher(code, amount)
        ).rejects.toThrowError(message);
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(errors.conflictError).toHaveBeenCalled();
        expect(voucherRepository.useVoucher).not.toHaveBeenCalled();
    });
});
