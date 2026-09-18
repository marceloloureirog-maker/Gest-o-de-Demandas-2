import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DemandItem, ReportFilterOptions, Unit } from '../types';

export function filterDemands(
  demands: DemandItem[],
  filters: ReportFilterOptions
): DemandItem[] {
  return demands.filter((item) => {
    // Unidade
    if (filters.unitId && filters.unitId !== 'ALL' && item.unitId !== filters.unitId) {
      return false;
    }
    // Tipo (Obras ou Logística)
    if (filters.type && filters.type !== 'ALL' && item.type !== filters.type) {
      return false;
    }
    // Subtipo / Especificidade (Podas, Telhado, Desinsetização, etc.)
    if (filters.subtype && filters.subtype !== 'ALL') {
      if (item.subtype.trim().toLowerCase() !== filters.subtype.trim().toLowerCase()) {
        return false;
      }
    }
    // Status
    if (filters.status && filters.status !== 'ALL' && item.status !== filters.status) {
      return false;
    }
    // Prioridade
    if (filters.priority && filters.priority !== 'ALL' && item.priority !== filters.priority) {
      return false;
    }
    // Data Início
    if (filters.startDate) {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      if (itemDate < filters.startDate) return false;
    }
    // Data Fim
    if (filters.endDate) {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      if (itemDate > filters.endDate) return false;
    }
    return true;
  });
}

export async function generateDemandsPdf(
  items: DemandItem[],
  filters: ReportFilterOptions,
  selectedUnit?: Unit | null
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Colors (Deep Blue theme)
  const primaryColor: [number, number, number] = [30, 58, 138]; // #1e3a8a
  const secondaryColor: [number, number, number] = [71, 85, 105]; // slate-600

  // 1. Top Decorative Bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // 2. Title & Header
  let yPos = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('RELATÓRIO GERENCIAL DE DEMANDAS', margin, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text('Mapeamento e Acompanhamento de Obras e Logística por Unidade', margin, yPos);

  const nowFormatted = new Date().toLocaleString('pt-BR');
  doc.setFontSize(8.5);
  doc.text(`Gerado em: ${nowFormatted}`, pageWidth - margin - doc.getTextWidth(`Gerado em: ${nowFormatted}`), yPos);

  yPos += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // 3. Filter Parameters Box
  yPos += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Parâmetros do Relatório:', margin + 4, yPos + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const unitLabel = selectedUnit
    ? `${selectedUnit.name} (${selectedUnit.code || 'Unidade'})`
    : filters.unitId && filters.unitId !== 'ALL'
    ? 'Unidade Específica'
    : 'Todas as Unidades';

  const typeLabel = filters.type && filters.type !== 'ALL' ? filters.type : 'Todos (Obras e Logística)';
  const subtypeLabel = filters.subtype && filters.subtype !== 'ALL' ? filters.subtype : 'Todas as especificidades';
  const statusLabel = filters.status && filters.status !== 'ALL' ? filters.status : 'Todos os Status';
  const priorityLabel = filters.priority && filters.priority !== 'ALL' ? filters.priority : 'Todas';

  doc.text(`• Unidade: ${unitLabel}`, margin + 4, yPos + 9.5);
  doc.text(`• Tipo: ${typeLabel}`, margin + 4, yPos + 13.5);
  doc.setFont('helvetica', filters.subtype && filters.subtype !== 'ALL' ? 'bold' : 'normal');
  if (filters.subtype && filters.subtype !== 'ALL') {
    doc.setTextColor(30, 58, 138); // Highlight specific subtype
  }
  doc.text(`• Especificidade: ${subtypeLabel}`, margin + 4, yPos + 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const col2X = margin + 90;
  doc.text(`• Status: ${statusLabel}`, col2X, yPos + 9.5);
  doc.text(`• Prioridade: ${priorityLabel}`, col2X, yPos + 13.5);
  doc.text(`• Total Selecionado: ${items.length} demanda(s)`, col2X, yPos + 17.5);

  // 4. Executive Summary KPI Cards
  yPos += 27;
  const totalItems = items.length;
  const pendentes = items.filter((i) => i.status === 'Pendente').length;
  const emAndamento = items.filter((i) => i.status === 'Em andamento').length;
  const concluidos = items.filter((i) => i.status === 'Concluído').length;
  const altaPrioridade = items.filter((i) => i.priority === 'Alta').length;

  const cardWidth = (pageWidth - margin * 2 - 12) / 4;
  const cardHeight = 13;

  const stats = [
    { label: 'Total Demandas', value: totalItems.toString(), color: [30, 58, 138] as [number, number, number] },
    { label: 'Pendentes', value: pendentes.toString(), color: [220, 38, 38] as [number, number, number] },
    { label: 'Em Andamento', value: emAndamento.toString(), color: [217, 119, 6] as [number, number, number] },
    { label: 'Concluídas', value: concluidos.toString(), color: [22, 163, 74] as [number, number, number] },
  ];

  stats.forEach((stat, index) => {
    const x = margin + index * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...stat.color);
    doc.text(stat.value, x + cardWidth / 2, yPos + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, x + cardWidth / 2, yPos + 10, { align: 'center' });
  });

  yPos += cardHeight + 6;

  // 5. Demands Data Table
  const tableRows = items.map((item, index) => {
    const createdDate = new Date(item.createdAt).toLocaleDateString('pt-BR');
    const photoText = item.photos && item.photos.length > 0 ? `${item.photos.length} foto(s)` : 'Sem fotos';
    const loc = item.locationDetails ? ` [${item.locationDetails}]` : '';
    const resolution = item.resolutionNotes ? `\nSolução: ${item.resolutionNotes}` : '';

    return [
      (index + 1).toString(),
      item.unitName,
      `${item.type}\n(${item.subtype})`,
      item.priority,
      item.status,
      createdDate,
      `${item.description}${loc}${resolution}`,
      photoText,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Unidade', 'Tipo / Subtipo', 'Prior.', 'Status', 'Data', 'Descrição e Detalhes', 'Fotos']],
    body: tableRows,
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 34 },
      2: { cellWidth: 26 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 16, halign: 'center' },
    },
    didParseCell: (data) => {
      // Colorize Status column cells
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text === 'Concluído') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Em andamento') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Pendente') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Colorize Priority column
      if (data.section === 'body' && data.column.index === 3) {
        const text = String(data.cell.raw);
        if (text === 'Alta') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Média') {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [59, 130, 246];
        }
      }
    },
    margin: { left: margin, right: margin, bottom: 16 },
  });

  // 6. Photographic Annex (if requested and items have photos)
  if (filters.includePhotosInPdf) {
    const itemsWithPhotos = items.filter((i) => i.photos && i.photos.length > 0);

    if (itemsWithPhotos.length > 0) {
      doc.addPage();
      let photoY = 18;

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 6, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('ANEXO FOTOGRÁFICO DE DEMANDAS', margin, photoY);

      photoY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryColor);
      doc.text('Registros visuais capturados para comprovação e acompanhamento das solicitações', margin, photoY);

      photoY += 6;
      doc.line(margin, photoY, pageWidth - margin, photoY);
      photoY += 6;

      for (const item of itemsWithPhotos) {
        // Check if we need a new page
        if (photoY > pageHeight - 75) {
          doc.addPage();
          photoY = 18;
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, pageWidth, 4, 'F');
        }

        // Section header for item
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, photoY, pageWidth - margin * 2, 8, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 58, 138);
        doc.text(`${item.unitName} — ${item.type}: ${item.subtype} [Status: ${item.status}]`, margin + 3, photoY + 5.5);

        photoY += 11;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const descPreview = item.description.length > 100 ? `${item.description.slice(0, 100)}...` : item.description;
        doc.text(`Descrição: ${descPreview}`, margin + 2, photoY);
        photoY += 5;

        // Render photos horizontally
        const thumbWidth = 38;
        const thumbHeight = 28;
        let xOffset = margin;

        for (let pIdx = 0; pIdx < item.photos.length && pIdx < 4; pIdx++) {
          const photo = item.photos[pIdx];
          try {
            doc.addImage(photo.dataUrl, 'JPEG', xOffset, photoY, thumbWidth, thumbHeight, undefined, 'FAST');
            doc.setDrawColor(203, 213, 225);
            doc.rect(xOffset, photoY, thumbWidth, thumbHeight);
            
            // Photo label below
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`Foto ${pIdx + 1}`, xOffset + 2, photoY + thumbHeight + 3.5);
          } catch (e) {
            console.warn('Erro ao inserir foto no PDF:', e);
          }
          xOffset += thumbWidth + 6;
        }

        photoY += thumbHeight + 9;
      }
    }
  }

  // 7. Add Page Numbers & Footer to all pages
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text(
      'Sistema de Gestão de Demandas — Obras e Logística',
      margin,
      pageHeight - 6
    );
    doc.text(
      `Página ${p} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
