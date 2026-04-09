import React, { useEffect } from "react";
import { Modal, Form, Select, Switch, InputNumber } from "antd";

const AVANCE = ["Backlog", "Próximo", "Jugando", "Jugado", "Completado", "Dropeado", "SinFin"];

const label = (v) => {
  if (v === "SinFin") return "Sin fin";
  return v?.replace(/_/g, " ");
};

/**
 * @param {object}  initialValues  – si se pasa, modo edición con campos pre-rellenados.
 */
const PlaythroughModal = ({ open, onCancel, onSubmit, loading, initialValues }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          avance: initialValues.avance ?? undefined,
          anyoJugado: initialValues.anyoJugado ?? undefined,
          horasJugadas: initialValues.horasJugadas ?? undefined,
          nota: initialValues.nota ?? undefined,
          completadoCien: !!initialValues.completadoCien,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar playthrough" : "Añadir playthrough"}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
      confirmLoading={loading}
      okText={isEdit ? "Actualizar" : "Guardar"}
      cancelText="Cancelar"
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ completadoCien: false }}>
        <Form.Item name="avance" label="Estado" rules={[{ required: true, message: "Selecciona estado" }]}>
          <Select placeholder="¿En qué punto estás?">
            {AVANCE.map((a) => <Select.Option key={a} value={a}>{label(a)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="anyoJugado" label="Año jugado">
          <InputNumber min={1970} max={2100} style={{ width: "100%" }} placeholder="Ej: 2025" />
        </Form.Item>

        <Form.Item name="horasJugadas" label="Horas jugadas">
          <InputNumber min={0} max={99999} step={0.5} style={{ width: "100%" }} placeholder="Ej: 42.5" />
        </Form.Item>

        <Form.Item name="nota" label="Nota (0–10)">
          <InputNumber min={0} max={10} step={0.5} style={{ width: "100%" }} placeholder="Ej: 8.5" />
        </Form.Item>

        <Form.Item name="completadoCien" label="Completado al 100%" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlaythroughModal;
