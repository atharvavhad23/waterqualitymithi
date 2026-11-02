import json
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'deep_learning_summary.json')
OUTPUT_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'deep_learning_comparison_report.pdf')


def load_data():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def format_float(value):
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float)):
        return f"{value:.4f}"
    return str(value)


def build_report(data):
    styles = getSampleStyleSheet()
    title = Paragraph('Mithi River Water Quality Deep Learning Comparison Report', styles['Title'])
    subtitle = Paragraph('Classification and Regression Model Performance Analysis', styles['Heading2'])
    summary = [
        title,
        Spacer(1, 0.2 * inch),
        subtitle,
        Spacer(1, 0.2 * inch),
    ]

    config = data.get('config', {})
    summary.append(Paragraph(
        f"Window size: {config.get('window_size', 'N/A')} | Batch size: {config.get('batch_size', 'N/A')} | Epochs: {config.get('epochs', 'N/A')} | Learning rate: {config.get('learning_rate', 'N/A')}",
        styles['BodyText']
    ))
    summary.append(Spacer(1, 0.15 * inch))

    class_results = data.get('classification', {}).get('results', {})
    class_best = data.get('classification', {}).get('best_model', 'N/A').upper()

    class_rows = [['Model', 'Accuracy', 'Macro F1', 'Weighted F1']]
    for model, metrics in class_results.items():
        class_rows.append([
            model,
            format_float(metrics.get('accuracy', 'N/A')),
            format_float(metrics.get('macro_f1', 'N/A')),
            format_float(metrics.get('weighted_f1', 'N/A'))
        ])

    class_table = Table(class_rows, colWidths=[1.2 * inch, 1.2 * inch, 1.2 * inch, 1.4 * inch])
    class_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4e79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))

    summary.append(Paragraph('Classification Performance Comparison', styles['Heading2']))
    summary.append(class_table)
    summary.append(Spacer(1, 0.2 * inch))

    best_class_para = Paragraph(
        f"Best classification model: {class_best} (selected using macro-F1 to handle class imbalance fairly, with strong recall on poor/unsafe conditions).",
        styles['BodyText']
    )
    summary.append(best_class_para)
    summary.append(Spacer(1, 0.15 * inch))

    reg_results = data.get('regression', {}).get('results', {})
    reg_best = data.get('regression', {}).get('best_model', 'N/A').upper()
    reg_rows = [['Model', 'MAE', 'RMSE', 'R2 Score']]
    for model, metrics in reg_results.items():
        reg_rows.append([
            model,
            format_float(metrics.get('mae', 'N/A')),
            format_float(metrics.get('rmse', 'N/A')),
            format_float(metrics.get('r2', 'N/A'))
        ])

    reg_table = Table(reg_rows, colWidths=[1.2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
    reg_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d6a4f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
    ]))

    summary.append(Paragraph('Regression Performance Comparison', styles['Heading2']))
    summary.append(reg_table)
    summary.append(Spacer(1, 0.2 * inch))

    best_reg_para = Paragraph(
        f"Best regression model: {reg_best} (selected using lowest RMSE and highest R2 score for predicting TDS, BOD, and COD).",
        styles['BodyText']
    )
    summary.append(best_reg_para)
    summary.append(Spacer(1, 0.2 * inch))

    # Extra detail section
    summary.append(Paragraph('Key Insight', styles['Heading2']))
    insight = Paragraph(
        'The data is highly imbalanced toward the Poor class, so macro-F1 was used for model selection instead of accuracy alone. This prevents the model from appearing strong simply by predicting the majority class. The best classification model was the CNN, while the best regression model was the ANN.',
        styles['BodyText']
    )
    summary.append(insight)

    return summary


def main():
    data = load_data()
    doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=letter, rightMargin=0.7 * inch, leftMargin=0.7 * inch, topMargin=0.7 * inch, bottomMargin=0.7 * inch)
    story = build_report(data)
    doc.build(story)
    print(f"PDF generated successfully: {OUTPUT_PATH}")


if __name__ == '__main__':
    main()
