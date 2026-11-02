import json
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SUMMARY_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'hybrid', 'hybrid_summary.json')
OUTPUT_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'hybrid', 'hybrid_model_accuracy_report.pdf')


def value(value, digits=4):
    return f'{float(value):.{digits}f}'


def percent(value):
    return f'{float(value) * 100:.2f}%'


def build_pdf(summary):
    styles = getSampleStyleSheet()
    story = [
        Paragraph('Mithi River Hybrid Model Accuracy Report', styles['Title']),
        Spacer(1, 0.15 * inch),
        Paragraph(f"Architecture: {summary['architecture']}", styles['Heading2']),
        Paragraph(f"Decomposition: {summary['decomposition']}", styles['BodyText']),
        Spacer(1, 0.15 * inch),
    ]

    config = summary['config']
    story.append(Paragraph('Training Configuration', styles['Heading2']))
    config_rows = [
        ['Window size', str(config['window_size'])],
        ['Sample rows', f"{config['sample_rows']:,}"],
        ['Epochs', str(config['epochs'])],
        ['Batch size', str(config['batch_size'])],
        ['Learning rate', str(config['learning_rate'])],
        ['Selected features', str(config['selected_features'])],
    ]
    config_table = Table(config_rows, colWidths=[2.1 * inch, 2.2 * inch])
    config_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.7, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eaf2f8')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.extend([config_table, Spacer(1, 0.2 * inch)])

    classification = summary['classification']
    story.append(Paragraph('Classification Accuracy', styles['Heading2']))
    class_rows = [
        ['Metric', 'Result'],
        ['Accuracy', percent(classification['accuracy'])],
        ['Macro F1', value(classification['macro_f1'])],
        ['Weighted F1', value(classification['weighted_f1'])],
        ['Test support', f"{int(classification['report']['weighted avg']['support']):,}"],
    ]
    class_table = Table(class_rows, colWidths=[2.1 * inch, 2.2 * inch])
    class_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4e79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.7, colors.grey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.extend([class_table, Spacer(1, 0.15 * inch)])

    labels = summary['labels']
    report = classification['report']
    per_class_rows = [['Class', 'Precision', 'Recall', 'F1', 'Support']]
    for index, label in enumerate(labels):
        metrics = report[str(index)]
        per_class_rows.append([
            label,
            value(metrics['precision']),
            value(metrics['recall']),
            value(metrics['f1-score']),
            str(int(metrics['support'])),
        ])
    per_class_table = Table(per_class_rows, colWidths=[1.2 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch])
    per_class_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#457b9d')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.7, colors.grey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))
    story.extend([Paragraph('Per-Class Classification Results', styles['Heading3']), per_class_table, Spacer(1, 0.2 * inch)])

    regression = summary['regression']
    story.append(Paragraph('Regression Performance: TDS, BOD, and COD', styles['Heading2']))
    regression_rows = [
        ['Metric', 'Result'],
        ['Mean absolute error (MAE)', value(regression['mae'], 2)],
        ['Root mean square error (RMSE)', value(regression['rmse'], 2)],
        ['R² score', value(regression['r2'], 4)],
    ]
    regression_table = Table(regression_rows, colWidths=[2.8 * inch, 1.5 * inch])
    regression_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d6a4f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.7, colors.grey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.extend([regression_table, Spacer(1, 0.2 * inch)])

    story.append(Paragraph('Interpretation', styles['Heading2']))
    story.append(Paragraph(
        'The model reports 96.90% classification accuracy, but this headline number is not sufficient for deployment because the dataset is highly imbalanced. The model correctly identifies the majority Poor class while showing zero recall for Good and Moderate in this test split. Macro-F1 is therefore the more important classification metric and currently indicates weak minority-class performance. The negative regression R² indicates that the regression component requires further improvement before production use.',
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph(
        'Selected classification features: ' + ', '.join(summary['selected_features_classification']),
        styles['BodyText']
    ))
    story.append(Paragraph(
        'Selected regression features: ' + ', '.join(summary['selected_features_regression']),
        styles['BodyText']
    ))

    return story


def main():
    with open(SUMMARY_PATH, 'r', encoding='utf-8') as handle:
        summary = json.load(handle)
    document = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
    )
    document.build(build_pdf(summary))
    print(f'PDF generated successfully: {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
