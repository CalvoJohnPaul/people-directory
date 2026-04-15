import {Portal} from '@ark-ui/react';
import {differenceInYears} from 'date-fns';
import {DownloadIcon} from 'lucide-react';
import {useCallback, useState} from 'react';
import {uid} from 'uid';
import * as XLSX from 'xlsx';
import {IconButton} from '~/components/ui/IconButton';
import {Tooltip} from '~/components/ui/Tooltip';
import {useMeQuery} from '~/hooks/useMeQuery';
import {usePeopleContext} from './PeopleContext';

const dateColumns = new Set(['Date of birth', 'Date registered']);
const numericColumns = new Set(['Age']);

export function ExportPeople() {
  const query = useMeQuery();
  const people = usePeopleContext();

  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(() => {
    if (people.length <= 0) {
      return;
    }

    setExporting(true);

    try {
      const rows = people.map((person) => ({
        'First name': person.firstName,
        'Middle name': person.middleName ?? '',
        'Last name': person.lastName,
        'Email address': person.emailAddress,
        'Mobile number': person.mobileNumber ?? '',
        Gender: person.gender ?? '',
        'Date of birth': person.dateOfBirth ?? null,
        Age: person.dateOfBirth ? differenceInYears(new Date(), person.dateOfBirth) : null,
        'Date registered': person.createdAt,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows, {
        cellDates: true,
        dateNF: 'yyyy-mm-dd hh:mm',
      });

      worksheet['!cols'] = [
        {wch: 16},
        {wch: 16},
        {wch: 16},
        {wch: 30},
        {wch: 18},
        {wch: 12},
        {wch: 20},
        {wch: 8},
        {wch: 22},
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');

      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const headerCell = worksheet[XLSX.utils.encode_cell({r: 0, c: col})];

        if (!headerCell || !dateColumns.has(String(headerCell.v))) {
          continue;
        }

        for (let row = 1; row <= range.e.r; row += 1) {
          const address = XLSX.utils.encode_cell({r: row, c: col});
          const cell = worksheet[address];
          if (!cell || (cell.t !== 'd' && cell.t !== 'n')) {
            continue;
          }

          cell.z = 'yyyy-mm-dd hh:mm';
        }
      }

      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const headerCell = worksheet[XLSX.utils.encode_cell({r: 0, c: col})];

        if (!headerCell || !numericColumns.has(String(headerCell.v))) {
          continue;
        }

        for (let row = 1; row <= range.e.r; row += 1) {
          const address = XLSX.utils.encode_cell({r: row, c: col});
          const cell = worksheet[address];
          if (!cell || cell.t !== 'n') {
            continue;
          }

          cell.z = '0';
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'People');
      XLSX.writeFile(workbook, `people-${uid(4)}.xlsx`, {
        cellDates: true,
      });
    } finally {
      setExporting(false);
    }
  }, [people]);

  if (query.data == null) return null;

  return (
    <Tooltip.Root disabled={exporting}>
      <Tooltip.Trigger asChild>
        <IconButton
          variant="outline"
          onClick={handleExport}
          disabled={people.length <= 0 || exporting}
          aria-label="Export people"
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            {people.length <= 0 ? 'No data to export' : 'Export'}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
