/**
 * Mock data types for VBScript execution context
 * Based on actual label template usage from l1.txt, l2.txt, l3.txt
 */

// ===== Address Types =====

export interface MockAddress {
    Name: string;
    Contact?: string;
    Reference?: string;
    Address1: string;
    Address2?: string;
    City: string;
    State?: string;
    ZipCode: string;
    ISOCountry: string;
    Phone?: string;
    attributes?: (key: string) => Record<string, any>;
}

export interface MockCountry {
    ISONumber: string;
}

// ===== Shipment Type =====

export interface MockShipment {
    OrderNo: string;
    Status: string;
    TrackingStatus?: string;
    routing1?: string;
    routingerror?: string;
    RouteNo?: string;
    CodeCAR?: string;
    CodeCSE?: string;

    // Addresses
    Sender: MockAddress & { Country: MockCountry };
    Receiver: MockAddress & { Country: MockCountry };
    Addresses: (key: string) => MockAddress;

    // Attributes access
    Attributes: (key: string) => any;

    // Date/time
    cr_time_db: {
        ToString: (format: string) => string;
    };
}

// ===== Parcel Type =====

export interface MockParcel {
    sequenceno: string;
    sequenceno2?: string;
    SequenceNo: string;
    SequenceNo2?: string;
    NumberOfParcels: number;
    Weight: number;
    OrderNo: string;
    typeofgoods?: string;

    // Attributes access
    Attributes: (key: string) => any;
}

// ===== Full Context =====

export interface MockDataContext {
    Shipment: MockShipment;
    Parcel: MockParcel;
}

// ===== Default Values =====

export function getDefaultMockData(): MockDataContext {
    const defaultAddress: MockAddress = {
        Name: 'Sample Company',
        Contact: 'John Doe',
        Address1: '123 Main Street',
        Address2: 'Suite 100',
        City: 'New York',
        State: 'NY',
        ZipCode: '10001',
        ISOCountry: 'US',
        Phone: '+1-555-0100',
        attributes: (_key: string) => ({})
    };

    return {
        Shipment: {
            OrderNo: 'ORD-12345',
            Status: '0',
            TrackingStatus: '0',
            routing1: 'ROUTE-A',
            routingerror: '',
            RouteNo: 'R001',
            CodeCAR: 'CAR001',
            CodeCSE: 'CSE001',

            Sender: {
                ...defaultAddress,
                Name: 'Sender Company',
                Country: { ISONumber: '840' }
            },

            Receiver: {
                ...defaultAddress,
                Name: 'Receiver Company',
                ISOCountry: 'US',
                Country: { ISONumber: '840' }
            },

            Addresses: (key: string) => {
                const addresses: Record<string, MockAddress> = {
                    'SENDER': { ...defaultAddress, Name: 'Sender Company' },
                    'RECEIVER': { ...defaultAddress, Name: 'Receiver Company' },
                    'COLLECTIONPOINT': { ...defaultAddress, Name: 'Collection Point' }
                };
                return addresses[key.toUpperCase()] || defaultAddress;
            },

            Attributes: (key: string) => {
                const attrs: Record<string, any> = {
                    'ByBox_Distribution_Centre': 'DC01',
                    'ByBox_SiteId': 'SITE123',
                    'ByBox_BoxNumber': '42',
                    'BYBOX_REFERENCE': 'REF-001',
                    'ByBox_CustNo': 'CUST-999',
                    'SortCode': 'S01',
                    'SENDERREFERENCE1': 'SR-001',
                    'LABELTEXT1': '',
                    'LABELTEXT2': '',
                    'orderrefrence': 'ORDER-REF',
                    'dpd_servicefieldinfo': '',
                    'dpd_servicemark': '',
                    'dpd_servicetext': 'D',
                    'dpd_d-depot': '0301',
                    'dpd_IATAlikecode': '',
                    'dpd_groupingpriority': '',
                    'dpd_o-sort': '01',
                    'dpd_d-sort': '02',
                    'dpd_servicecode': 'D',
                    'dpd_zipcode': '',
                    'dpd_version': 'v1.0',
                    'dpd_barcodeidascii': '%',
                    'ESWVALIDATION': '',
                    'HOLD': '',
                    'GENERALDATA': () => ({
                        'ZEBRA-LH': '^LH0,50',
                        'warehousename': 'Main Warehouse'
                    })
                };

                const value = attrs[key];
                return typeof value === 'function' ? value() : { [key]: value };
            },

            cr_time_db: {
                ToString: (format: string) => {
                    const now = new Date();
                    // Simple date formatting
                    if (format.includes('dd/MM/yyyy HH:mm')) {
                        const dd = String(now.getDate()).padStart(2, '0');
                        const MM = String(now.getMonth() + 1).padStart(2, '0');
                        const yyyy = now.getFullYear();
                        const HH = String(now.getHours()).padStart(2, '0');
                        const mm = String(now.getMinutes()).padStart(2, '0');
                        return `${dd}/${MM}/${yyyy} ${HH}:${mm}`;
                    }
                    return now.toISOString();
                }
            }
        },

        Parcel: {
            sequenceno: '001',
            sequenceno2: '987654',
            SequenceNo: '0301123456789012',
            SequenceNo2: '987654',
            NumberOfParcels: 1,
            Weight: 25.5,
            OrderNo: 'ORD-12345',
            typeofgoods: 'Electronics',

            Attributes: (key: string) => {
                const attrs: Record<string, any> = {
                    'ByBox_TrackWithoutCheck': '123456789',
                    'ByBox_2dBarcode': 'ABC123XYZ',
                    'LabelData': '',
                    'LabelData1': '',
                    'LabelData2': '',
                    'LabelData3': ''
                };
                return attrs[key] || '';
            }
        }
    };
}

// ===== Preset Templates =====

export interface MockDataPreset {
    name: string;
    description: string;
    data: MockDataContext;
}

export const MOCK_DATA_PRESETS: MockDataPreset[] = [
    {
        name: 'Default',
        description: 'Basic shipment with minimal data',
        data: getDefaultMockData()
    },
    {
        name: 'ByBox Heavy Package',
        description: 'ByBox label with heavy package (>20kg)',
        data: {
            ...getDefaultMockData(),
            Parcel: {
                ...getDefaultMockData().Parcel,
                Weight: 25.5
            }
        }
    },
    {
        name: 'Error Status',
        description: 'Shipment with error status (Status=99)',
        data: {
            ...getDefaultMockData(),
            Shipment: {
                ...getDefaultMockData().Shipment,
                Status: '99',
                routingerror: 'Invalid routing code'
            }
        }
    },
    {
        name: 'DPD Sweden',
        description: 'DPD label for Swedish delivery',
        data: {
            ...getDefaultMockData(),
            Shipment: {
                ...getDefaultMockData().Shipment,
                Receiver: {
                    ...getDefaultMockData().Shipment.Receiver,
                    ISOCountry: 'SE',
                    ZipCode: '212 41',
                    City: 'MALMÖ',
                    Country: { ISONumber: '752' }
                }
            }
        }
    }
];
