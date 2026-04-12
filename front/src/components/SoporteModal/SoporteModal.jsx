import React, { useEffect } from "react";
import { Modal, Form, Select, Switch, InputNumber, DatePicker } from "antd";
import dayjs from "dayjs";

const TIPO = ["Fisico", "Digital"];
const ESTADO = ["Perfecto", "Muy_bueno", "Bueno", "Meh", "Mal", "Roto"];
const EDICION = ["Normal", "Deluxe", "Coleccionista", "Limitada"];
const DISTRIBUCION = [
  "LRG", "SuperRare", "SRG", "iam8bit", "Fangamer", "PlayAsia",
  "Red_Art_Games", "Pix_n_Love", "First_Press_Games", "Premium_Edition", "VBlank",
  "PlayStation_Store", "Xbox_Store", "Nintendo_eShop", "Steam",
  "Epic_Games_Store", "GOG", "Humble_Bundle", "Retail", "Otro",
];
const REGION = ["PAL", "PAL_ESP", "PAL_UK", "PAL_FR", "PAL_USK", "NTSC_JP", "NTSC_USA"];
const TIENDA = ["Amazon", "Mediamarkt", "Game", "Fnac", "Miravia", "Wallapop", "Vinted"];

const label = (v) => v?.replace(/_/g, " ");

/**
 * @param {object}  initialValues  – si se pasa, el modal entra en modo edición
 *                                   con los campos pre-rellenados.
 */
const SoporteModal = ({ open, onCancel, onSubmit, loading, initialValues }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues;

  // Cada vez que cambia initialValues o se abre el modal, rellenamos el form
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          tipo: initialValues.tipo ?? undefined,
          estado: initialValues.estado ?? undefined,
          edicion: initialValues.edicion ?? undefined,
          distribucion: initialValues.distribucion ?? undefined,
          region: initialValues.region ?? undefined,
          tienda: initialValues.tienda ?? undefined,
          anyoSalidaDist: initialValues.anyoSalidaDist ?? undefined,
          precio: initialValues.precio ?? undefined,
          fechaCompra: initialValues.fechaCompra ? dayjs(initialValues.fechaCompra) : undefined,
          precintado: !!initialValues.precintado,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Convertir dayjs a string YYYY-MM-DD para el backend
      if (values.fechaCompra) {
        values.fechaCompra = values.fechaCompra.format("YYYY-MM-DD");
      }
      await onSubmit(values);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar copia (soporte)" : "Añadir copia (soporte)"}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
      confirmLoading={loading}
      okText={isEdit ? "Actualizar" : "Guardar"}
      cancelText="Cancelar"
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ precintado: false }}>
        <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: "Selecciona tipo" }]}>
          <Select placeholder="Físico / Digital">
            {TIPO.map((t) => <Select.Option key={t} value={t}>{label(t)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="estado" label="Estado">
          <Select placeholder="Estado de la copia" allowClear>
            {ESTADO.map((e) => <Select.Option key={e} value={e}>{label(e)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="edicion" label="Edición">
          <Select placeholder="Edición" allowClear>
            {EDICION.map((e) => <Select.Option key={e} value={e}>{label(e)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="distribucion" label="Distribución">
          <Select placeholder="Distribución" allowClear showSearch>
            {DISTRIBUCION.map((d) => <Select.Option key={d} value={d}>{label(d)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="region" label="Región">
          <Select placeholder="Región" allowClear>
            {REGION.map((r) => <Select.Option key={r} value={r}>{label(r)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="tienda" label="Tienda">
          <Select placeholder="Tienda de compra" allowClear>
            {TIENDA.map((t) => <Select.Option key={t} value={t}>{label(t)}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="anyoSalidaDist" label="Año de salida (distribución)">
          <InputNumber min={1970} max={2100} style={{ width: "100%" }} placeholder="Ej: 2024" />
        </Form.Item>

        <Form.Item name="precio" label="Precio (€)">
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Ej: 29.99" />
        </Form.Item>

        <Form.Item name="fechaCompra" label="Fecha de compra">
          <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} placeholder="Selecciona fecha" />
        </Form.Item>

        <Form.Item name="precintado" label="Precintado" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SoporteModal;
