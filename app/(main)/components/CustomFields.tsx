// components/CustomFields/CustomFields.tsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import { classNames } from 'primereact/utils';
import { useTranslation } from 'react-i18next';
import { CustomField } from '@/types/interface';

interface CustomFieldsProps {
  fields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
  submitted?: boolean;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  fields,
  onFieldsChange,
  submitted = false
}) => {
  const { t } = useTranslation();
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [newExample, setNewExample] = useState('');

  const emptyCustomField: CustomField = {
    name: '',
    type: 'text',
    label: { en: '', fa: '' },
    placeholder: { en: '', fa: '' },
    keyboard: 'default',
    validators: { required: false, minLength: 0, maxLength: 0 },
    examples: []
  };

  const fieldTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Date', value: 'date' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Select', value: 'select' },
  ];

  const keyboardTypeOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Phone', value: 'phone' },
    { label: 'Email', value: 'email' },
    { label: 'Numeric', value: 'numeric' },
    { label: 'Decimal', value: 'decimal' },
  ];

  const addField = () => {
    const newField = { ...emptyCustomField };
    const updatedFields = [...fields, newField];
    onFieldsChange(updatedFields);
    setActiveFieldIndex(updatedFields.length - 1);
  };

  const updateField = (index: number, field: Partial<CustomField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    onFieldsChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    onFieldsChange(updatedFields);

    if (activeFieldIndex === index) {
      setActiveFieldIndex(null);
    } else if (activeFieldIndex !== null && activeFieldIndex > index) {
      setActiveFieldIndex(activeFieldIndex - 1);
    }
  };

  const addExample = (fieldIndex: number) => {
    if (!newExample.trim()) return;

    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    field.examples = [...(field.examples || []), newExample.trim()];
    onFieldsChange(updatedFields);

    setNewExample('');
  };

  const removeExample = (fieldIndex: number, exampleIndex: number) => {
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    field.examples = field.examples.filter((_, i) => i !== exampleIndex);
    onFieldsChange(updatedFields);
  };

  return (
    <div className="field mt-4">
      <div className="flex justify-content-between align-items-center mb-3">

        <Button
          icon="pi pi-plus"
          label={t('CUSTOM.FIELDS.ADD')}
          className="p-button-sm"
          onClick={addField}
        />
      </div>

      {fields && fields.length > 0 ? (
        <Accordion activeIndex={activeFieldIndex} onTabChange={(e) => setActiveFieldIndex(e.index as number)}>
          {fields.map((field, index) => (
            <AccordionTab
              key={index}
              header={
                <div className="flex align-items-center gap-2">
                  <span>{field.name || t('CUSTOM.FIELDS.NEW_FIELD')}</span>
                  <Badge value={field.type} severity="info" className="ml-2" />
                </div>
              }
            >
              <Card>
                <div className="formgrid grid">
                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-name-${index}`}>{t('CUSTOM.FIELDS.NAME')} *</label>
                    <InputText
                      id={`field-name-${index}`}
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder={t('CUSTOM.FIELDS.NAME_PLACEHOLDER')}
                      className={classNames({
                        'p-invalid': submitted && !field.name
                      })}
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-type-${index}`}>{t('CUSTOM.FIELDS.TYPE')}</label>
                    <Dropdown
                      id={`field-type-${index}`}
                      value={field.type}
                      options={fieldTypeOptions}
                      onChange={(e) => updateField(index, { type: e.value })}
                      optionLabel="label"
                      placeholder={t('CUSTOM.FIELDS.TYPE_PLACEHOLDER')}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-label-en-${index}`}>{t('CUSTOM.FIELDS.LABEL_EN')} *</label>
                    <InputText
                      id={`field-label-en-${index}`}
                      value={field.label.en}
                      onChange={(e) => updateField(index, {
                        label: { ...field.label, en: e.target.value }
                      })}
                      placeholder={t('CUSTOM.FIELDS.LABEL_EN_PLACEHOLDER')}
                      className={classNames({
                        'p-invalid': submitted && !field.label.en
                      })}
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-label-fa-${index}`}>{t('CUSTOM.FIELDS.LABEL_FA')}</label>
                    <InputText
                      id={`field-label-fa-${index}`}
                      value={field.label.fa}
                      onChange={(e) => updateField(index, {
                        label: { ...field.label, fa: e.target.value }
                      })}
                      placeholder={t('CUSTOM.FIELDS.LABEL_FA_PLACEHOLDER')}
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-placeholder-en-${index}`}>{t('CUSTOM.FIELDS.PLACEHOLDER_EN')}</label>
                    <InputText
                      id={`field-placeholder-en-${index}`}
                      value={field.placeholder.en}
                      onChange={(e) => updateField(index, {
                        placeholder: { ...field.placeholder, en: e.target.value }
                      })}
                      placeholder={t('CUSTOM.FIELDS.PLACEHOLDER_EN_PLACEHOLDER')}
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-placeholder-fa-${index}`}>{t('CUSTOM.FIELDS.PLACEHOLDER_FA')}</label>
                    <InputText
                      id={`field-placeholder-fa-${index}`}
                      value={field.placeholder.fa}
                      onChange={(e) => updateField(index, {
                        placeholder: { ...field.placeholder, fa: e.target.value }
                      })}
                      placeholder={t('CUSTOM.FIELDS.PLACEHOLDER_FA_PLACEHOLDER')}
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor={`field-keyboard-${index}`}>{t('CUSTOM.FIELDS.KEYBOARD')}</label>
                    <Dropdown
                      id={`field-keyboard-${index}`}
                      value={field.keyboard}
                      options={keyboardTypeOptions}
                      onChange={(e) => updateField(index, { keyboard: e.value })}
                      optionLabel="label"
                      placeholder={t('CUSTOM.FIELDS.KEYBOARD_PLACEHOLDER')}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label>{t('CUSTOM.FIELDS.VALIDATORS')}</label>
                    <div className="flex flex-column gap-2 mt-2">
                      <div className="flex align-items-center">
                        <InputSwitch
                          checked={field.validators.required}
                          onChange={(e) => updateField(index, {
                            validators: { ...field.validators, required: e.value }
                          })}
                        />
                        <label className="ml-2">{t('CUSTOM.FIELDS.REQUIRED')}</label>
                      </div>
                    </div>
                  </div>

                  {field.validators.required && (
                    <>
                      <div className="field col-12 md:col-6">
                        <label htmlFor={`field-minlength-${index}`}>{t('CUSTOM.FIELDS.MIN_LENGTH')}</label>
                        <InputText
                          id={`field-minlength-${index}`}
                          type="number"
                          value={field.validators.minLength.toString()}
                          onChange={(e) => updateField(index, {
                            validators: { ...field.validators, minLength: parseInt(e.target.value) || 0 }
                          })}
                          placeholder={t('CUSTOM.FIELDS.MIN_LENGTH_PLACEHOLDER')}
                        />
                      </div>

                      <div className="field col-12 md:col-6">
                        <label htmlFor={`field-maxlength-${index}`}>{t('CUSTOM.FIELDS.MAX_LENGTH')}</label>
                        <InputText
                          id={`field-maxlength-${index}`}
                          type="number"
                          value={field.validators.maxLength.toString()}
                          onChange={(e) => updateField(index, {
                            validators: { ...field.validators, maxLength: parseInt(e.target.value) || 0 }
                          })}
                          placeholder={t('CUSTOM.FIELDS.MAX_LENGTH_PLACEHOLDER')}
                        />
                      </div>
                    </>
                  )}

                  <div className="field col-12">
                    <label htmlFor={`field-examples-${index}`}>{t('CUSTOM.FIELDS.EXAMPLES')}</label>
                    <div className="flex gap-2 mb-2">
                      <InputText
                        id={`field-examples-${index}`}
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        placeholder={t('CUSTOM.FIELDS.EXAMPLE_PLACEHOLDER')}
                        className="flex-1"
                      />
                      <Button
                        icon="pi pi-plus"
                        onClick={() => addExample(index)}
                        disabled={!newExample.trim()}
                      />
                    </div>

                    {field.examples && field.examples.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.examples.map((example, exIndex) => (
                          <div key={exIndex} className="p-chip">
                            <span className="p-chip-text">{example}</span>
                            <span
                              className="p-chip-remove-icon pi pi-times-circle"
                              onClick={() => removeExample(index, exIndex)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-content-end mt-3">
                  <Button
                    icon="pi pi-trash"
                    label={t('CUSTOM.FIELDS.REMOVE')}
                    className="p-button-danger p-button-sm"
                    onClick={() => removeField(index)}
                  />
                </div>
              </Card>
            </AccordionTab>
          ))}
        </Accordion>
      ) : (
        // <div className="text-center p-4 border-2 border-dashed border-300 border-round">
        //   <i className="pi pi-inbox text-4xl text-400 mb-3"></i>
        //   <p className="text-600">{t('CUSTOM.FIELDS.NO_FIELDS')}</p>
        //   <Button
        //     icon="pi pi-plus"
        //     label={t('CUSTOM.FIELDS.ADD_FIRST')}
        //     className="mt-3"
        //     onClick={addField}
        //   />
        // </div>
        <></>
      )}
    </div>
  );
};
