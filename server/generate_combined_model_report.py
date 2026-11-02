import json
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DEEP_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'deep_learning_summary.json')
HYBRID_PATH = os.path.join(BASE_DIR, 'deep_learning_models', 'hybrid', 'hybrid_summary.json')
OUTPUT_PATH = os.path.join(ROOT_DIR, 'ALL_MODEL_COMPARISON_REPORT.pdf')


def load_json(path):
    with open(path, 'r', encoding='utf-8') as handle:
        return json.load(handle)


def f(value, digits=4):
    try:
        return f'{float(value):.{digits}f}'
    except (TypeError, ValueError):
        return str(value)


def pct(value):
    try:
        return f'{float(value) * 100:.2f}%'
    except (TypeError, ValueError):
        return str(value)


def table(rows, widths, header_color='#1f4e79', font_size=8):
    result = Table(rows, colWidths=widths, repeatRows=1)
    result.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(header_color)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.6, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f6f8')]),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), font_size),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return result


def build_story(deep, hybrid):
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph('Mithi River Water Quality: Combined Model Comparison', styles['Title']))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph('Classical ML, deep learning, and hybrid model results', styles['Heading2']))
    story.append(Paragraph(
        'This report combines the saved evaluation results available in the project. Metrics from different experiments are shown separately because they use different sample sizes, splits, and validation protocols. They should not be treated as one controlled leaderboard.',
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.18 * inch))

    story.append(Paragraph('Executive Summary', styles['Heading2']))
    summary_rows = [
        ['Area', 'Best verified result', 'Model'],
        ['Classical ML raw accuracy', '99.86% accuracy; macro-F1 0.6864', 'Random Forest Classifier'],
        ['Deep learning classification', '97.40% accuracy; macro-F1 0.7570', 'LSTM'],
        ['Deep learning classification fairness metric', 'Macro-F1 0.7688', 'CNN'],
        ['Deep learning regression', 'R² 0.6290; RMSE 6.1119', 'ANN'],
        ['Hybrid classification', '96.90% accuracy; macro-F1 0.3281', 'Attention BiLSTM + XGBoost'],
        ['Hybrid regression', 'R² -0.0103; RMSE 817.8865', 'Attention BiLSTM + XGBoost'],
    ]
    story.append(table(summary_rows, [2.0 * inch, 3.2 * inch, 2.0 * inch], '#264653', 8))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        '<b>Important:</b> the dataset is heavily imbalanced toward Poor water quality. Accuracy alone is therefore misleading. Macro-F1 and per-class recall are more meaningful for Good and Moderate detection.',
        styles['BodyText']
    ))
    story.append(PageBreak())

    story.append(Paragraph('1. Classical Machine Learning', styles['Heading1']))
    story.append(Paragraph('Actual 400,000-row evaluation run', styles['Heading2']))
    actual_rows = [
        ['Model / Task', 'Accuracy', 'Macro-F1', 'Weighted-F1', 'R² / RMSE / MAE'],
        ['Random Forest classifier / WQI', '99.86%', '0.6864', '0.9980', 'N/A'],
        ['Linear regression / TDS', 'N/A', 'N/A', 'N/A', 'R² -0.0000 / 1414.17 / 1224.16'],
        ['Linear regression / BOD', 'N/A', 'N/A', 'N/A', 'R² -0.0000 / 5.48 / 4.74'],
        ['Linear regression / COD', 'N/A', 'N/A', 'N/A', 'R² -0.0000 / 54.79 / 47.41'],
    ]
    story.append(table(actual_rows, [2.3 * inch, 1.0 * inch, 1.0 * inch, 1.1 * inch, 2.2 * inch], '#1f4e79'))
    story.append(Spacer(1, 0.16 * inch))
    story.append(Paragraph('Separate RF-vs-KNN classification experiment', styles['Heading2']))
    comparison_rows = [
        ['Model / Task', 'Accuracy', 'Weighted F1'],
        ['Random Forest / WQI', '52.66%', '0.3634'],
        ['K-Nearest Neighbors / WQI', '44.52%', '0.4051'],
        ['Random Forest / TDS range', '40.80%', '0.2369'],
        ['Random Forest / BOD range', '52.66%', '0.3634'],
        ['Random Forest / COD range', '52.66%', '0.3634'],
        ['Range classification average', '48.71%', 'N/A'],
    ]
    story.append(table(comparison_rows, [3.0 * inch, 1.6 * inch, 1.8 * inch], '#457b9d'))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph('Source files: ML_MODEL_PERFORMANCE_REPORT_ACTUAL.txt and MODEL_COMPARISON_REPORT.txt', styles['BodyText']))
    story.append(PageBreak())

    story.append(Paragraph('2. Deep Learning Models', styles['Heading1']))
    story.append(Paragraph('ANN, CNN, RNN, and LSTM comparison', styles['Heading2']))
    class_rows = [['Model', 'Accuracy', 'Macro-F1', 'Weighted-F1']]
    for model, metrics in deep['classification']['results'].items():
        class_rows.append([model, pct(metrics['accuracy']), f(metrics['macro_f1']), f(metrics['weighted_f1'])])
    story.append(table(class_rows, [2.0 * inch, 1.5 * inch, 1.5 * inch, 1.7 * inch], '#1f4e79'))
    story.append(Spacer(1, 0.16 * inch))
    reg_rows = [['Model', 'MAE', 'RMSE', 'R²']]
    for model, metrics in deep['regression']['results'].items():
        reg_rows.append([model, f(metrics['mae'], 4), f(metrics['rmse'], 4), f(metrics['r2'], 4)])
    story.append(Paragraph('Regression results for TDS, BOD, and COD', styles['Heading2']))
    story.append(table(reg_rows, [2.0 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch], '#2d6a4f'))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph(
        f"Saved selection: classification best model = {deep['classification']['best_model'].upper()}; regression best model = {deep['regression']['best_model'].upper()}. CNN has the highest macro-F1, while LSTM has the highest raw accuracy in this saved run.",
        styles['BodyText']
    ))
    story.append(PageBreak())

    story.append(Paragraph('3. Hybrid CEEMDAN-Attention-BiLSTM-XGBoost', styles['Heading1']))
    story.append(Paragraph(f"Decomposition used: {hybrid['decomposition']}", styles['BodyText']))
    hybrid_class = hybrid['classification']
    hybrid_reg = hybrid['regression']
    hybrid_rows = [
        ['Task', 'Accuracy', 'Macro-F1', 'Weighted-F1', 'RMSE', 'R²', 'MAE'],
        ['Classification', pct(hybrid_class['accuracy']), f(hybrid_class['macro_f1']), f(hybrid_class['weighted_f1']), 'N/A', 'N/A', 'N/A'],
        ['Regression', 'N/A', 'N/A', 'N/A', f(hybrid_reg['rmse']), f(hybrid_reg['r2']), f(hybrid_reg['mae'])],
    ]
    story.append(table(hybrid_rows, [1.3 * inch, 1.0 * inch, 1.0 * inch, 1.1 * inch, 1.0 * inch, 0.8 * inch, 0.8 * inch], '#6a4c93'))
    story.append(Spacer(1, 0.16 * inch))
    story.append(Paragraph('Selected classification features: ' + ', '.join(hybrid['selected_features_classification']), styles['BodyText']))
    story.append(Paragraph('Selected regression features: ' + ', '.join(hybrid['selected_features_regression']), styles['BodyText']))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph(
        'Interpretation: the hybrid model reports high raw accuracy because the Poor class dominates the test set, but its macro-F1 of 0.3281 and zero Good/Moderate recall show that minority-class performance needs improvement. Its regression R² is negative, so the regression head is not ready for deployment.',
        styles['BodyText']
    ))
    story.append(PageBreak())

    story.append(Paragraph('4. Overall Conclusions', styles['Heading1']))
    conclusions = [
        ['Decision area', 'Recommended model', 'Reason'],
        ['WQI classification headline accuracy', 'Random Forest', 'Highest saved raw accuracy: 99.86%'],
        ['WQI classification fairness', 'CNN', 'Highest saved deep-learning macro-F1: 0.7688'],
        ['Deep-learning regression', 'ANN', 'Best saved deep-learning R²: 0.6290 and RMSE: 6.1119'],
        ['Hybrid architecture', 'Further development required', 'Useful research direction, but current macro-F1 and regression R² are weak'],
    ]
    story.append(table(conclusions, [2.0 * inch, 2.0 * inch, 3.4 * inch], '#264653', 8))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('Validation and data limitations', styles['Heading2']))
    story.append(Paragraph(
        'The source experiments use different sample counts and validation designs: classical ML includes a 400,000-row evaluation, deep learning uses a saved 60,000-row run, and the hybrid model uses a chronological next-step setup with 20,000 sampled rows. Therefore, the tables document the project history and measured results, but a final scientific ranking requires retraining every model on one shared chronological split with identical preprocessing and target definitions.',
        styles['BodyText']
    ))
    story.append(Spacer(1, 0.14 * inch))
    story.append(Paragraph(
        'Recommended next experiment: rebalance the Good and Moderate classes, install and use true CEEMDAN, add month/rainfall/lag features, and retrain all model families under the same chronological train/validation/test protocol.',
        styles['BodyText']
    ))
    return story


def main():
    deep = load_json(DEEP_PATH)
    hybrid = load_json(HYBRID_PATH)
    document = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=landscape(letter),
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )
    document.build(build_story(deep, hybrid))
    print(f'PDF generated successfully: {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
